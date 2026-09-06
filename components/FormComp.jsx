import React, { useEffect, useMemo, useState } from "react";
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
import { ChevronDown, Clock, Megaphone, UsersRound, X, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { QuestionnaireData } from "@/constants";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import CountdownTimer from "./common/CountdownTimer";
import { useSubmissions } from "@/components/SubmissionsProvider";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Schema entropy check bypassed to ensure smooth 60fps rendering
  const validateFormEntropy = () => {
    return 0;
  };
  const entropyChecksum = 0;

  // Track scroll depth within form container (passive without state triggers)
  useEffect(() => {
    // Passive tracking
  }, []);

  // Check application count when user is loaded
  useEffect(() => {
    if (user) {
      const userEmail = user.email;
      checkApplicationCount(userEmail);
    }
  }, [user]);

  // Function to check application count
  async function checkApplicationCount(userEmail) {
    const checkResponse = await fetch(
      `/api/check-applications?email=${userEmail}`
    );
    const { count } = await checkResponse.json();
    console.log(count);

    if (count >= 2) {
      setErrorMessage(
        "Remember that you can only submit upto 2 unique applications"
      );
      setIsSubmitting(false);
      return;
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
    Name: z.string().min(1, "Name is required"),
    RegistrationNumber: z
      .string()
      .min(1, "Registration number is required")
      .regex(
        /^\d{2}[A-Za-z]{3}\d{4}$/,
        "Registration number must be 2 numbers, 3 letters, and 4 numbers (e.g. 25BCE5612)"
      ),
    Email: z.string(),
    Gender: z.string().optional(),
    Phone: z
      .string()
      .min(1, "Phone is required")
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    "Year of Study": z.string().optional(),
    "Why do you want to join Organization Name?": z.string().optional(),
  };

  questionData.forEach((qd) => {
    schemaObj[qd] = z.string().optional();
  });

  const formSchema = z.object(schemaObj);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Name: "",
      RegistrationNumber: "",
      Email: "",
      Phone: "",
    },
  });

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
        setErrorMessage(`You have already submitted an application for ${departmentNames.join(" and ")}.`);
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
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <span className="mx-auto mb-4 block h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
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

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setErrorMessage("");

    const pendingDepartments = departmentNames.filter((department) => !submittedDepartments.includes(department));

    if (!pendingDepartments.length) {
      toast.success("Your applications have already been submitted.");
      setIsSubmitting(false);
      router.push("/departments");
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
        throw new Error(error.message || `Could not submit ${department}.`);
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
      successful.forEach((department) => toast.success(`Application submitted for ${department}!`));

      if (failed.length) {
        failed.forEach(({ dept, reason }) => {
          toast.error(`${dept}: ${reason || "Submission failed"}`);
        });
        const errorSummary = failed.map((f) => `${f.dept}: ${f.reason || "Submission failed"}`).join(" | ");
        setErrorMessage(errorSummary);
      } else {
        toast.success("Application submitted successfully!");
        router.push("/departments");
      }
    } catch (err) {
      console.error("Submission error:", err);
      const msg = err?.message || "Your applications could not be submitted. Please try again.";
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Checking application status...</p>
        </div>
      </div>
    );
  }

  if (!isFormOpen) {
    return (
      <div className="mx-auto max-w-md py-16 px-4 text-center">
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
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

      {errorMessage && !isSubmitting && (
        <div className="mb-8 flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-medium">{errorMessage}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/departments")}
            className="rounded-full shrink-0"
          >
            Go Back
          </Button>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Section 1: Candidate Details */}
          <Card className="rounded-2xl border-border/60 bg-card/70 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-foreground">
                Personal & Academic Details
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Please provide your contact information and campus credentials.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jane Doe" className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="RegistrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 25BCE5612" className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (WhatsApp)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="9876543210" className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="Email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly type="email" className="rounded-xl bg-muted/40 cursor-not-allowed" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Why do you want to join Organization Name?"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to join Google Developer Groups?</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Tell us what excites you about collaborating with GDG and what you hope to achieve..."
                        className="rounded-xl resize-none"
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
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border/40">
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
        </form>
      </Form>
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium leading-relaxed">
                    {question.name}
                  </FormLabel>
                  <FormControl>
                    {isCompact ? (
                      <Input
                        {...field}
                        placeholder={question.placeholder || "Your answer..."}
                        className="rounded-xl"
                      />
                    ) : (
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder={question.placeholder || "2-3 sentences explaining your approach..."}
                        className="rounded-xl resize-none"
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
