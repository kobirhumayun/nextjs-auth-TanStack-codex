// File: src/components/features/admin/user-table.js
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Table of users with quick search and navigation to profiles.
export default function UserTable({ users = [], onViewProfile }) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();
    return users.filter((user) =>
      [user.username, user.email, user.plan].some((value) => value.toLowerCase().includes(term))
    );
  }, [users, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Users</h2>
        <Input
          className="w-full sm:max-w-xs"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.plan}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>{user.registeredAt}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => onViewProfile?.(user)}>
                    View Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filteredUsers.length && (
          <p className="p-4 text-sm text-muted-foreground">No users match the current search filter.</p>
        )}
      </div>
    </div>
  );
}
