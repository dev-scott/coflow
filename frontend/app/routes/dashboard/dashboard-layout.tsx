import { Header } from "@/components/layout/header";
import { SidebarComponent } from "@/components/layout/sidebar-component";
import { Loader } from "@/components/loader";
import { CreateWorkspace } from "@/components/workspace/create-workspace";
import { fetchData } from "@/lib/fetch-util";
import { useAuth } from "@/provider/auth-context";
import { useGetWorkspacesQuery } from "@/hooks/use-workspace";
import type { Workspace } from "@/types";
import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  useLoaderData,
  useLocation,
  useSearchParams,
} from "react-router";

export const clientLoader = async () => {
  try {
    const [workspaces] = await Promise.all([fetchData("/workspaces")]);
    return { workspaces };
  } catch (error) {
    console.log(error);
    return { workspaces: [] };
  }
};

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );

  const loaderData = useLoaderData() as { workspaces?: Workspace[] } | undefined;
  const { data: queryWorkspaces } = useGetWorkspacesQuery();
  const workspaces = (queryWorkspaces || loaderData?.workspaces || []) as Workspace[];

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const workspaceIdFromUrl = searchParams.get("workspaceId");

  useEffect(() => {
    if (!workspaces || workspaces.length === 0) {
      setCurrentWorkspace(null);
      return;
    }

    if (workspaceIdFromUrl) {
      const found = workspaces.find((ws) => ws._id === workspaceIdFromUrl);
      if (found) {
        setCurrentWorkspace(found);
        return;
      }
    }

    // Default to the first workspace if not specified or not on a specific workspace route
    const defaultWs = workspaces[0];
    setCurrentWorkspace(defaultWs);

    if (!location.pathname.includes("/workspaces/")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("workspaceId", defaultWs._id);
      setSearchParams(newParams, { replace: true });
    }
  }, [workspaces, workspaceIdFromUrl, location.pathname]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  const handleWorkspaceSelected = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
  };

  return (
    <div className="flex h-screen w-full">
      <SidebarComponent currentWorkspace={currentWorkspace} />

      <div className="flex flex-1 flex-col h-full">
        <Header
          onWorkspaceSelected={handleWorkspaceSelected}
          selectedWorkspace={currentWorkspace}
          onCreateWorkspace={() => setIsCreatingWorkspace(true)}
        />

        <main className="flex-1 overflow-y-auto h-full w-full">
          <div className="mx-auto container px-2 sm:px-6 lg:px-8 py-0 md:py-8 w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <CreateWorkspace
        isCreatingWorkspace={isCreatingWorkspace}
        setIsCreatingWorkspace={setIsCreatingWorkspace}
      />
    </div>
  );
};

export default DashboardLayout;
