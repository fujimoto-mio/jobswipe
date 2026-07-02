"use client";

import SeekerBrandHeader from "@/components/seeker/SeekerBrandHeader";

type SeekerAuthShellProps = {
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export default function SeekerAuthShell({
  title,
  subtitle,
  footer,
  children,
}: SeekerAuthShellProps) {
  return (
    <div className="seeker-ui seeker-auth">
      <header className="seeker-auth-header">
        <SeekerBrandHeader showMenu={false} logoHref="/" className="seeker-auth-header__bar" />
      </header>

      <main className="seeker-auth-main">
        <div className="seeker-auth-card">
          <div className="seeker-auth-intro">
            <h1 className="seeker-auth-title">{title}</h1>
            <p className="seeker-auth-subtitle">{subtitle}</p>
          </div>

          <div className="seeker-auth-body">{children}</div>

          {footer ? <div className="seeker-auth-footer">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
