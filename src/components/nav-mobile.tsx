"use client"

import { useState } from "react";
import { NavItem, navs } from "./nav";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import { ChevronRightIcon } from "lucide-react";
import { VisuallyHidden } from "./ui/visually-hidden";

export default function NavMobile() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="sm:hidden">
                    <ChevronRightIcon className="h-4 w-4 text-primary" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <VisuallyHidden>
                    <SheetTitle>Navigation</SheetTitle>
                </VisuallyHidden>
                <div className="flex flex-col gap-2">
                    {navs.map(({ href, label }) => (
                        <NavItem
                            href={href}
                            label={label}
                            key={label}
                            onClick={() => {
                                setOpen(false);
                            }}
                        />
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}