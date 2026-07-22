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
        "fixed inset-0 z-50 bg-foreground/40 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
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
  ...props
}: DialogPrimitive.Popup.Props & { showClose?: boolean }) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPrimitive.Popup
        data-slot="dialog-popup"
        className={cn(
          "bg-background fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-t-3xl p-6 shadow-lg transition-all duration-150 data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
          className,
        )}
        {...props}
      >
        {showClose && (
          <DialogPrimitive.Close className="bg-secondary hover:bg-border absolute top-4 right-4 flex size-9 items-center justify-center rounded-xl transition-colors">
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
        "bg-secondary hover:bg-border flex size-10 items-center justify-center rounded-xl transition-colors",
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
