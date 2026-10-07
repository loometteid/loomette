import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogBackdrop({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-backdrop"
      className={cn(
        "fixed inset-0 z-50 bg-[#C9C3B7]/30 backdrop-blur-[1px] transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogPopup({
  className,
  children,
  showClose = true,
  variant = "center",
  ...props
}: DialogPrimitive.Popup.Props & {
  showClose?: boolean;
  variant?: "center" | "bottom";
}) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPrimitive.Popup
        data-slot="dialog-popup"
        className={cn(
          variant === "bottom"
            ? "bg-background fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-t-3xl p-6 shadow-lg transition-all duration-150 data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full"
            : "bg-[#FAFAF7] fixed inset-0 m-auto z-50 flex h-fit max-h-[90vh] w-[calc(100%-2rem)] max-w-md flex-col overflow-y-auto rounded-3xl p-6 shadow-2xl transition-all duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          className,
        )}
        {...props}
      >
        {showClose && (
          <DialogPrimitive.Close className="bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] absolute top-4 right-4 flex size-10 items-center justify-center rounded-xl transition-colors">
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogClose({ className, ...props }: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      className={cn(
        "bg-[#F2EDE5] hover:bg-[#EAE4DC] text-[#444440] flex size-10 items-center justify-center rounded-xl transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-serif text-2xl", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogClose,
  DialogTitle,
  DialogDescription,
};
