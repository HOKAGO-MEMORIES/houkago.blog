"use client";

import { useState } from "react";
import { NavItem, navs } from "./nav";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import { VisuallyHidden } from "./ui/visually-hidden";

export default function NavMobile() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          title="메뉴"
          className="hidden h-11 rounded-full px-2 text-[13px] font-semibold text-muted-foreground shadow-none hover:bg-muted hover:text-foreground max-[760px]:inline-flex max-[420px]:px-1.5 max-[420px]:text-xs"
        >
          <span>{open ? "닫기" : "메뉴"}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="top-[var(--header-height)] max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-x-0 border-b border-[oklch(var(--border-strong))] bg-background px-[var(--layout-gutter)] pb-6 pt-3 shadow-xl"
      >
        <VisuallyHidden>
          <SheetTitle>모바일 메뉴</SheetTitle>
        </VisuallyHidden>
        <nav
          aria-label="모바일 메뉴"
          className="mx-auto flex w-full max-w-[var(--wide-content-width)] flex-col pr-14"
        >
          {navs.map(({ href, label }) => (
            <NavItem
              href={href}
              label={label}
              key={label}
              mobile
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
