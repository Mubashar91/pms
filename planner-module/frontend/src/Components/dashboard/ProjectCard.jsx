
import React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  TrendingUp,
  Target
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const healthColors = {
  "On Track": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle2 },
  "At Risk": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: AlertTriangle },
  "Delayed": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: AlertTriangle },
  "Blocked": { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: Clock },
};

const priorityColors = {
  "Low": "bg-blue-100 text-blue-800",
  "Medium": "bg-yellow-100 text-yellow-800",
  "High": "bg-orange-100 text-orange-800",
  "Critical": "bg-red-100 text-red-800"
};

export default function ProjectCard({ project, onEdit, onView }) {
  const healthConfig = healthColors[project.health] || healthColors["On Track"];
  const HealthIcon = healthConfig.icon;

  const daysUntilDeadline = project.end_date
    ? Math.ceil((new Date(project.end_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 glass-card">
        {/* Gradient accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: project.health === "On Track"
              ? "linear-gradient(90deg, var(--success-green), var(--primary-blue))"
              : project.health === "At Risk"
              ? "linear-gradient(90deg, var(--warning-yellow), var(--accent-purple))"
              : "linear-gradient(90deg, var(--error-red), var(--warning-yellow))"
          }}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className={`${priorityColors[project.priority]} text-xs font-medium`}
                >
                  {project.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {project.type}
                </Badge>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                {project.title}
              </h3>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {project.description}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(project)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  Edit Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Health Status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${healthConfig.bg} ${healthConfig.border} border`}>
            <HealthIcon className={`w-4 h-4 ${healthConfig.text}`} />
            <span className={`text-sm font-medium ${healthConfig.text}`}>
              {project.health}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Progress
              </span>
              <span className="font-semibold text-gray-900">{project.progress}%</span>
            </div>
            <Progress
              value={project.progress}
              className="h-2"
              style={{
                background: 'var(--neutral-200)'
              }}
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                Deadline
              </div>
              <div className="text-sm font-medium text-gray-900">
                {project.end_date ? format(new Date(project.end_date), "MMM d, yyyy") : "Not set"}
              </div>
              {daysUntilDeadline !== null && (
                <div className={`text-xs ${daysUntilDeadline < 0 ? 'text-red-600' : daysUntilDeadline < 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                  {daysUntilDeadline < 0
                    ? `${Math.abs(daysUntilDeadline)} days overdue`
                    : `${daysUntilDeadline} days left`
                  }
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                Team
              </div>
              <div className="text-sm font-medium text-gray-900">
                {project.team_members?.length || 0} members
              </div>
              <div className="text-xs text-gray-500">
                Active team
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}