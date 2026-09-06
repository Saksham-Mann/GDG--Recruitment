import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ChevronDown, Clock, Megaphone, UsersRound, X, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { QuestionnaireData } from "@/constants";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import CountdownTimer from "./common/CountdownTimer";
import { useSubmissions } from "@/components/SubmissionsProvider";
import FormSkeleton from "@/components/skeletons/FormSkeleton";
import CandidateStatusCard from "@/components/CandidateStatusCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { cn } from "@/lib/utils";

const normaliseQuestion = (question) => (
  typeof question === "string"
    ? { name: question, type: "generic", placeholder: "2-3 sentences" }
    : question
);

const FormComp = ({ dept1, dept2, isLoading, setIsLoading }) => {
  // Use Better Auth's useSession hook directly
  const { data: session, isPending, error } = authClient.useSession();
  
  const user = session?.user;
  const isSignedIn = !!user;
  const isLoaded = !isPending;

  // Form lifecycle and input telemetry state
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState(null);
  const [submissionSuccessData, setSubmissionSuccessData] = useState(null);
  const [liveApplications, setLiveApplications] = useState([]);
  const [liveOverallStatus, setLiveOverallStatus] = useState("waitlisted");
  const [nameInputVal, setNameInputVal] = useState("");
  const [regNumberInputVal, setRegNumberInputVal] = useState("");
  const [emailInputVal, setEmailInputVal] = useState("");
  const [phoneInputVal, setPhoneInputVal] = useState("");
  const [formCompletionPercentage, setFormCompletionPercentage] = useState(0);
  const [keyStrokeCounter, setKeyStrokeCounter] = useState(0);
  const [syncTick, setSyncTick] = useState(0);
  const [formScrollOffset, setFormScrollOffset] = useState(0);

  const router = useRouter();
  const { submittedDepartments: contextSubmitted, markDepartmentsSubmitted } = useSubmissions();
  const [submittedDepartments, setSubmittedDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const departmentNames = useMemo(
    () => [dept1, dept2].filter(Boolean).map((department) => typeof department === "string" ? department : department.name),
    [dept1, dept2]
  );
  const draftKey = user?.email && departmentNames.length
    ? `recruitment-draft:${user.email}:${[...departmentNames].sort().join("|")}`
    : null;

  // Check application count when user is loaded
  useEffect(() => {
    if (user) {
      const userEmail = user.email;
      checkApplicationCount(userEmail);
    }
  }, [user]);

  // Function to check application count
  async function checkApplicationCount(userEmail) {
    try {
      const checkResponse = await fetch(
        `/api/check-applications?email=${encodeURIComponent(userEmail)}`
      );
      const data = await checkResponse.json();
      if (data?.applications) {
        setLiveApplications(data.applications);
      }
      if (data?.overallStatus && data.overallStatus !== "none") {
        setLiveOverallStatus(data.overallStatus);
      }
      if (data?.count >= 2) {
        setLimitReached(true);
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error("Failed to check application count:", e);
    }
  }

  const normalizeDeptName = (str) => (str ? str.trim().toLowerCase().replace(/\s*\/\s*/g, "/") : "");

  const questionData = useMemo(
    () => [...new Set(departmentNames.flatMap((department) =>
      (QuestionnaireData.find((item) => normalizeDeptName(item.department) === normalizeDeptName(department))?.questions ?? [])
        .map(normaliseQuestion)
        .map((question) => question.name)
    ))],
    [departmentNames]
  );

  const schemaObj = {
    Name: z
      .string()
      .trim()
      .min(1, "Full Name is required. Please enter your full name.")
      .min(2, "Name must be at least 2 characters long."),
    RegistrationNumber: z
      .string()
      .trim()
      .min(1, "Registration number is required.")
      .regex(
        /^\d{2}[A-Za-z]{3}\d{4}$/,
        "Invalid registration number format. Must be 2 digits, 3 letters, and 4 digits (e.g., 25BCE5612)."
      ),
    Email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Invalid email format. Please enter a valid email address (e.g. name@example.com)."),
    Gender: z.string().optional(),
    Phone: z
      .string()
      .trim()
      .min(1, "Phone number is required.")
      .regex(/^\d{10}$/, "Invalid phone number. Must contain exactly 10 digits without country code."),
    "Year of Study": z.string().optional(),
    "Why do you want to join Organization Name?": z
      .string({ required_error: "Please tell us why you want to join Google Developer Groups." })
      .trim()
      .min(1, "Please tell us why you want to join Google Developer Groups.")
      .max(3000, "Response must not exceed 3000 characters."),
  };

  questionData.forEach((qd) => {
    schemaObj[qd] = z
      .string({ required_error: "This answer is required. Please provide a response." })
      .trim()
      .min(1, "This question is required. Please provide a response.");
  });

  const formSchema = z.object(schemaObj);
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      Name: "",
      RegistrationNumber: "",
      Email: "",
      Phone: "",
      Gender: "",
      "Why do you want to join Organization Name?": "",
    },
  });

  const handleInvalid = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstField = errorKeys[0];
      const element = document.querySelector(`[name="${firstField}"]`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  useEffect(() => {
    if (!isLoaded || !user || !draftKey) return;

    const email = user.email;
    let isActive = true;
    setIsDraftReady(false);

    try {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      form.reset({ ...form.getValues(), ...savedDraft.values, Email: email });
    } catch {
      form.setValue("Email", email);
    }

    async function initialiseForm() {
      const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "{}");
      let remoteSubmitted = contextSubmitted || [];

      if (!remoteSubmitted.length) {
        const cacheKey = `submitted_depts_${email}`;
        const cached = typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null;

        if (cached) {
          try {
            remoteSubmitted = JSON.parse(cached);
          } catch {}
        } else {
          try {
            const response = await fetch(`/api/check-applications?email=${encodeURIComponent(email)}`);
            const result = await response.json();
            if (result?.submittedDepartments) {
              remoteSubmitted = result.submittedDepartments;
              if (typeof window !== "undefined") {
                sessionStorage.setItem(cacheKey, JSON.stringify(remoteSubmitted));
              }
            }
          } catch (err) {
            console.error("Failed to check applications:", err);
          }
        }
      }

      if (!isActive) return;
      const completed = [...new Set([...(savedDraft.submittedDepartments || []), ...remoteSubmitted])];
      setSubmittedDepartments(completed);
      if (departmentNames.length > 0 && departmentNames.every((dept) => completed.includes(dept))) {
        setLimitReached(true);
      }
      localStorage.setItem(draftKey, JSON.stringify({ values: form.getValues(), submittedDepartments: completed }));
      setLoading(false);
      setIsDraftReady(true);
    }

    initialiseForm().catch(() => {
      if (isActive) {
        setLoading(false);
        setIsDraftReady(true);
      }
    });

    return () => { isActive = false; };
  }, [contextSubmitted, departmentNames, draftKey, form, isLoaded, user]);

  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    if (!isDraftReady || !draftKey) return;
    localStorage.setItem(draftKey, JSON.stringify({ values: watchedValues, submittedDepartments }));
  }, [draftKey, isDraftReady, submittedDepartments, watchedValues]);

  // Check if user is authenticated
  if (!isLoaded) {
    return <FormSkeleton />;
  }

  if (!isSignedIn) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] m-10">
        <div className="text-center">
          <p className="text-2xl font-semibold text-white mb-4">
            Sign In Required
          </p>
          <p className="text-lg text-gray-300 mb-6">
            Please sign in to access the application form.
          </p>
          <Button onClick={() => router.push("/auth/signin")} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // User is authenticated
  const userEmail = user?.email;

  const handleInitiateSubmit = (values) => {
    setSubmitError("");
    setPendingFormValues(values);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmission = async () => {
    if (!pendingFormValues) return;
    setShowConfirmModal(false);
    await executeSubmission(pendingFormValues);
  };

  const executeSubmission = async (values) => {
    setIsSubmitting(true);
    setSubmitError("");

    const pendingDepartments = departmentNames.filter((department) => !submittedDepartments.includes(department));

    if (!pendingDepartments.length) {
      setIsSubmitting(false);
      setSubmissionSuccessData({
        candidateName: values.Name,
        applications: submittedDepartments.map((dept) => ({
          department: dept,
          status: "waitlisted",
          createdAt: new Date().toISOString(),
        })),
      });
      return;
    }

    const basicDetails = {
      Name: values.Name,
      RegistrationNumber: values.RegistrationNumber ? values.RegistrationNumber.trim().toUpperCase() : "",
      Email: values.Email,
      Gender: values.Gender || "",
      Phone: values.Phone,
      "Year of Study": values["Year of Study"] || "",
      "Why do you want to join Organization Name?": values["Why do you want to join Organization Name?"] || "",
    };

    const submitDepartment = async (department) => {
      const questions = (QuestionnaireData.find((item) => normalizeDeptName(item.department) === normalizeDeptName(department))?.questions ?? [])
        .map(normaliseQuestion);

      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...basicDetails,
          Department: department,
          Questions: questions.reduce((answers, question) => ({ ...answers, [question.name]: values[question.name] || "" }), {}),
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        let friendlyMessage = error.message;
        if (!friendlyMessage || friendlyMessage === "Error submitting form") {
          friendlyMessage = `Submission Interrupted for ${department}: Server could not complete processing. Your drafted answers are preserved locally. Please check your network connection and click 'Submit Application' again.`;
        }
        throw new Error(friendlyMessage);
      }
      return { department, success: true };
    };

    try {
      const results = await Promise.allSettled(pendingDepartments.map(submitDepartment));
      const successful = results
        .filter((result) => result.status === "fulfilled" && result.value.success)
        .map((result) => result.value.department);
      const failed = results.flatMap((result, index) =>
        result.status === "rejected" ? [{ dept: pendingDepartments[index], reason: result.reason?.message }] : []
      );
      const completed = [...new Set([...submittedDepartments, ...successful])];

      setSubmittedDepartments(completed);
      markDepartmentsSubmitted(completed);
      if (draftKey) localStorage.setItem(draftKey, JSON.stringify({ values, submittedDepartments: completed }));
      if (typeof window !== "undefined" && values?.Email) {
        sessionStorage.setItem(`submitted_depts_${values.Email}`, JSON.stringify(completed));
      }

      if (failed.length) {
        const errorSummary = failed.map((f) => `${f.dept}: ${f.reason || "Submission failed"}`).join(" | ");
        setSubmitError(errorSummary);
      } else {
        if (draftKey && typeof window !== "undefined") {
          try {
            localStorage.removeItem(draftKey);
          } catch {}
        }
        setSubmissionSuccessData({
          candidateName: values.Name,
          applications: completed.map((dept) => ({
            department: dept,
            status: "waitlisted",
            createdAt: new Date().toISOString(),
          })),
        });
        toast.success("Application submitted successfully!");
      }
    } catch (err) {
      console.error("Submission error:", err);
      const msg = err?.message || "Your applications could not be submitted. Please check your network connection and try again.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  // Display post-submission success view
  if (submissionSuccessData) {
    return (
      <div className="mx-auto max-w-3xl py-12 px-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <CandidateStatusCard
          status="waitlisted"
          isPostSubmission={true}
          applications={submissionSuccessData.applications}
          candidateName={submissionSuccessData.candidateName}
        />
      </div>
    );
  }

  // Display status card if user has already reached submission limit
  if (limitReached) {
    const displayApps =
      liveApplications.length > 0
        ? liveApplications
        : submittedDepartments.map((dept) => ({
            department: dept,
            status: "waitlisted",
          }));

    return (
      <div className="mx-auto max-w-3xl py-12 px-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <CandidateStatusCard
          status={liveOverallStatus || "waitlisted"}
          isPostSubmission={false}
          applications={displayApps}
          candidateName={user?.name || ""}
        />
      </div>
    );
  }

  if (!isFormOpen) {
    return (
      <div className="mx-auto max-w-md py-16 px-4 text-center animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none">
        <Card className="rounded-2xl border-border/60 bg-card/60 p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Recruitment Closed</CardTitle>
            <CardDescription className="pt-2 text-sm text-muted-foreground">
              Applications for this cycle have concluded. Thank you for your interest in Google Developer Groups!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out motion-reduce:animate-none motion-reduce:transition-none">
      {/* Form Header */}
      <div className="mb-8 pb-6 border-b border-border/40">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Step 02 · Candidate Application</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Application Form
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Applying to: <strong className="text-foreground">{departmentNames.join(" & ")}</strong>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleInitiateSubmit, handleInvalid)} noValidate className="space-y-8">
          {/* Section 1: Candidate Details */}
          <Card className="rounded-2xl border-border/60 bg-card/70 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-foreground">
                Personal & Academic Details
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Please provide your contact information and campus credentials. Required fields are marked with an asterisk (*).
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className={fieldState.error ? "text-red-500 font-semibold" : ""}>
                        Full Name <span className="text-red-500" aria-hidden="true">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Jane Doe"
                          className={cn(
                            "rounded-xl transition-colors",
                            fieldState.error ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500" : "border-input"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="RegistrationNumber"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className={fieldState.error ? "text-red-500 font-semibold" : ""}>
                        Registration Number <span className="text-red-500" aria-hidden="true">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 25BCE5612"
                          className={cn(
                            "rounded-xl uppercase transition-colors",
                            fieldState.error ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500" : "border-input"
                          )}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Gender"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className={fieldState.error ? "text-red-500 font-semibold" : ""}>
                        Gender
                      </FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          className={cn(
                            "flex h-10 w-full rounded-xl border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                            fieldState.error
                              ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500"
                              : "border-input focus-visible:ring-ring"
                          )}
                        >
                          <option value="">Select Gender (Optional)</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className={fieldState.error ? "text-red-500 font-semibold" : ""}>
                        Phone Number (WhatsApp) <span className="text-red-500" aria-hidden="true">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="9876543210"
                          className={cn(
                            "rounded-xl transition-colors",
                            fieldState.error ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500" : "border-input"
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="Email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className={fieldState.error ? "text-red-500 font-semibold" : ""}>
                      Email Address <span className="text-red-500" aria-hidden="true">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="name@example.com"
                        readOnly={!!user?.email}
                        className={cn(
                          "rounded-xl transition-colors",
                          fieldState.error ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500" : "border-input",
                          user?.email && "bg-muted/40 cursor-not-allowed opacity-90"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Why do you want to join Organization Name?"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className={fieldState.error ? "text-red-500 font-semibold" : ""}>
                      Why do you want to join Google Developer Groups? <span className="text-red-500" aria-hidden="true">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Tell us what excites you about collaborating with GDG and what you hope to achieve..."
                        className={cn(
                          "rounded-xl resize-none transition-colors",
                          fieldState.error ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500" : "border-input"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Department Specific Questions */}
          {renderDepartmentQuestions(departmentNames[0], QuestionnaireData, form)}
          {departmentNames[1] && renderDepartmentQuestions(departmentNames[1], QuestionnaireData, form)}

          {/* Form Actions */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            {submitError && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs sm:text-sm font-medium text-red-500 animate-in fade-in-0 duration-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{submitError}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted-foreground text-center sm:text-left max-w-md leading-normal">
                By submitting, you agree to our{" "}
                <Link href="/terms" target="_blank" className="text-primary font-medium underline hover:text-primary/80 transition-colors">
                  User Agreement
                </Link>{" "}
                and acknowledge our{" "}
                <Link href="/privacy" target="_blank" className="text-primary font-medium underline hover:text-primary/80 transition-colors">
                  Privacy Policy
                </Link>.
              </p>

              <div className="flex items-center justify-end gap-3 w-full sm:w-auto shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/departments")}
                  className="rounded-full px-6 font-medium"
                >
                  Change Departments
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="rounded-full px-8 font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* Submission Confirmation Modal Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-2 text-left">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Confirm Application Submission
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to submit your application? You won't be able to edit your answers after this.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Submitting for
            </p>
            <div className="flex flex-wrap gap-2">
              {departmentNames.map((dept) => (
                <span
                  key={dept}
                  className="inline-flex items-center rounded-lg bg-background px-2.5 py-1 text-xs font-semibold text-foreground border border-border/60 shadow-xs"
                >
                  {dept}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              By confirming, you certify that all answers and links are truthful, original, and comply with our{" "}
              <Link href="/terms" target="_blank" className="text-primary underline hover:text-primary/80">
                User Agreement
              </Link>.
            </p>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
              className="rounded-full px-5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSubmission}
              disabled={isSubmitting}
              className="rounded-full px-6 font-semibold shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Confirm & Submit</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const renderDepartmentQuestions = (department, QuestionnaireData, form) => {
  const normalizeDeptName = (str) => (str ? str.trim().toLowerCase().replace(/\s*\/\s*/g, "/") : "");
  const questions = (
    QuestionnaireData.find(qd => normalizeDeptName(qd.department) === normalizeDeptName(department))?.questions ?? []
  )
    .map(normaliseQuestion)
    .filter((question) => question.name !== "Why do you want to join Organization Name?" && question.name !== "Why do you want to join DWASFW?");

  if (!questions.length) return null;

  return (
    <Card className="rounded-2xl border-border/60 bg-card/70 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground">
          {department} Track Questions
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Questions tailored to assess your experience and skill sets in {department}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question) => {
          const isCompact = question.type === "short-text";

          return (
            <FormField
              key={question.name}
              control={form.control}
              name={question.name}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={cn("text-sm font-medium leading-relaxed", fieldState.error && "text-red-500 font-semibold")}>
                    {question.name} <span className="text-red-500" aria-hidden="true">*</span>
                  </FormLabel>
                  <FormControl>
                    {isCompact ? (
                      <Input
                        {...field}
                        placeholder={question.placeholder || "Your answer..."}
                        className={cn(
                          "rounded-xl transition-colors",
                          fieldState.error ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500" : "border-input"
                        )}
                      />
                    ) : (
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder={question.placeholder || "2-3 sentences explaining your approach..."}
                        className={cn(
                          "rounded-xl resize-none transition-colors",
                          fieldState.error ? "border-red-500 focus-visible:ring-red-500 focus:ring-red-500" : "border-input"
                        )}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};

export default FormComp;
