"use client";

import { DownloadIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDeleteAccount, useExportData } from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { clearDeviceToken } from "@/lib/session";
import { useAuth } from "@/providers";

const CONFIRM_WORD = "DELETE";

export function AccountDataView() {
  const { user, signOut } = useAuth();
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();

  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  /**
   * The export is JSON straight from the API, saved with a Blob rather than a
   * link to the endpoint: the request needs an Authorization header, which a
   * plain `<a download>` cannot send.
   */
  const download = async () => {
    try {
      const data = await exportData.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `citycare-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);

      toast.success("Export downloaded.");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const remove = async () => {
    try {
      const result = await deleteAccount.mutateAsync();
      toast.success(result.message);
      clearDeviceToken();
      await signOut();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1">
            <h2 className="h-card">Export your data</h2>
            <p className="text-sm text-muted-foreground">
              One JSON file with your profile, complaints, applications,
              payments, feedback, notifications and session history. Password
              and token hashes are deliberately left out.
            </p>
          </div>

          <Separator />

          <Button
            disabled={exportData.isPending}
            onClick={() => void download()}
          >
            {exportData.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <DownloadIcon data-icon="inline-start" />
            )}
            Download my data
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/25">
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1">
            <h2 className="h-card text-destructive">Delete your account</h2>
            <p className="text-sm text-muted-foreground">
              Your account is closed and every session is revoked immediately.
            </p>
          </div>

          <Alert variant="destructive">
            <AlertTitle>What survives, and why</AlertTitle>
            <AlertDescription>
              Complaints and payments are not erased with the account — a public
              works record and a financial record have to stay whole. Your
              personal details are anonymised by a scheduled job 30 days later.
              {user?.isSuperAdmin
                ? " As a super admin, you cannot delete the last remaining super admin account."
                : ""}
            </AlertDescription>
          </Alert>

          <Separator />

          <Button variant="destructive" onClick={() => setOpen(true)}>
            <Trash2Icon data-icon="inline-start" />
            Delete my account
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setConfirmation("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this account?</DialogTitle>
            <DialogDescription>
              This cannot be undone from here. Consider downloading your export
              first.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="delete-confirm">
              Type {CONFIRM_WORD} to confirm
            </FieldLabel>
            <Input
              id="delete-confirm"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Keep my account
            </DialogClose>
            <Button
              variant="destructive"
              disabled={
                confirmation !== CONFIRM_WORD || deleteAccount.isPending
              }
              onClick={() => void remove()}
            >
              {deleteAccount.isPending && (
                <Loader2Icon className="animate-spin" />
              )}
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
