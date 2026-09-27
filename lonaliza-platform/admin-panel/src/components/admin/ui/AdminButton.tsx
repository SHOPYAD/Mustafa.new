"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export type AdminButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type AdminButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  href?: string;
  external?: boolean;
}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      icon,
      iconPosition = "left",
      disabled,
      href,
      external,
      type = "button",
      ...props
    },
    ref
  ) => {
    const variantClass = {
      primary: "admin-btn-primary",
      secondary: "admin-btn-secondary",
      outline: "admin-btn-outline",
      ghost: "admin-btn-ghost",
      destructive: "admin-btn-destructive",
    }[variant];

    const sizeClass = {
      sm: "admin-btn-sm",
      md: "admin-btn-md",
      lg: "admin-btn-lg",
      icon: "admin-btn-icon",
      "icon-sm": "admin-btn-icon-sm",
    }[size];

    const combinedClassName = `admin-btn ${variantClass} ${sizeClass} ${className}`.trim();

    const content = (
      <>
        {isLoading && <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />}
        {!isLoading && icon && iconPosition === "left" && icon}
        {children && <span>{children}</span>}
        {!isLoading && icon && iconPosition === "right" && icon}
      </>
    );

    if (href) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={combinedClassName}
            aria-disabled={disabled || isLoading}
          >
            {content}
          </a>
        );
      }
      return (
        <Link
          href={href}
          className={combinedClassName}
          aria-disabled={disabled || isLoading}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

AdminButton.displayName = "AdminButton";

export default AdminButton;
