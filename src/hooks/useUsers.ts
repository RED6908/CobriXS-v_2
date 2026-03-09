import { useEffect, useState, useCallback } from "react";
import { getUsers } from "../services/users.service";
import type { UserProfile } from "../types/database";

export function useUsers() {

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    reload: loadUsers
  };
}