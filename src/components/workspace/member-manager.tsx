"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, UserMinus, Users } from "lucide-react";
import type { Member } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface MemberManagerProps {
  workspaceId: string;
  workspaceName: string;
  canManage: boolean;
  currentUserId: string;
  initialMembers: Member[];
}

const roleLabels = { OWNER: "Owner", ADMIN: "Admin", MEMBER: "Member" };

export function MemberManager({
  workspaceId,
  workspaceName,
  canManage,
  currentUserId,
  initialMembers,
}: MemberManagerProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.member) {
        setMembers((prev) => [...prev, data.member]);
        setEmail("");
        toast.success("Member invited.");
      } else {
        toast.error(data?.error ?? "Failed to invite member.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
    setInviting(false);
  }

  async function removeMember(memberId: string, name: string) {
    if (!confirm(`Remove ${name} from this workspace?`)) return;
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        toast.success(`${name} removed.`);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error ?? "Failed to remove member.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <form
          onSubmit={invite}
          className="rounded-xl border border-border-subtle bg-surface-raised p-4"
        >
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <Users className="h-4 w-4 text-primary" />
            Invite a member
          </h3>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              className="sm:flex-1"
            />
            <Select
              value={inviteRole}
              onChange={setInviteRole}
              options={[
                { value: "MEMBER", label: "Member" },
                { value: "ADMIN", label: "Admin" },
              ]}
              className="w-full sm:w-32"
            />
            <Button type="submit" loading={inviting} disabled={!email.trim()}>
              <Plus className="h-4 w-4" />
              Invite
            </Button>
          </div>
          <p className="mt-2 text-xs text-ink-subtle">
            The invited person must have an ORBIT account to join {workspaceName}.
          </p>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-raised">
        <div className="border-b border-border-subtle px-4 py-3 text-sm font-semibold text-ink-muted">
          Members ({members.length})
        </div>
        <div className="divide-y divide-border-subtle">
          {members.map((member) => {
            const isSelf = member.userId === currentUserId;
            return (
              <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={member.name} color={member.avatarColor} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {member.name} {isSelf && <span className="text-ink-subtle">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-ink-subtle">{member.email}</p>
                </div>
                <span className="rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium text-ink-muted">
                  {roleLabels[member.role]}
                </span>
                {canManage && member.role !== "OWNER" && (
                  <button
                    onClick={() => removeMember(member.id, member.name)}
                    className="rounded-md p-1.5 text-ink-subtle hover:bg-red-500/10 hover:text-red-400"
                    title="Remove member"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
