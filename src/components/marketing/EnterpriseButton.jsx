import React from "react";
import { CONTACT_PAGE_URL } from "../../config/contact";

export function EnterpriseButton({ className, ...props }) {
  return (
    <a
      href={CONTACT_PAGE_URL}
      className={className}
      title="Contact AI Vatika about custom plans and software"
      {...props}
    >
      Enterprise
    </a>
  );
}
