"use client";

import React from "react";

export const CheckBoxComp = React.forwardRef(
  ({ intermediate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolveRef = ref || defaultRef;

    React.useEffect(() => {
      if (resolveRef.current) {
        resolveRef.current.indeterminate = Boolean(intermediate);
      }
    }, [resolveRef, intermediate]);
    return (
      <>
        <input
          type="checkbox"
          ref={resolveRef}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer transition-colors"
          {...rest}
        />
      </>
    );
  }
);

CheckBoxComp.displayName = "CheckBoxComp";
