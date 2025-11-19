import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Header from "./layout/header";

const AdminStats = () => {
  const { data: adminstats } = useQuery({
    queryKey: [`/api/dashboard/admin/stats`],
    queryFn: () =>
      apiRequest("GET", `/api/dashboard/admin/stats`).then((res) => res.json()),
  });

  console.log("adminstats", adminstats);
  return (
    <div className="container mx-auto">
      <Header title="Stats" subtitle="This is short stats" />
      <div className="px-4 py-4">sdfdsfdf</div>
    </div>
  );
};

export default AdminStats;
