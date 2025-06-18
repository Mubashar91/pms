import React from "react";
import { motion } from "framer-motion";

import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  MessageSquare
} from "lucide-react";
import { isToday } from "date-fns";

export default function TimelineCell({ date, tasks, updates }) {
  const hasActivity = tasks.length > 0 || updates.length > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-2 border-t border-gray-200 min-h-[100px] transition-all duration-200 flex flex-col gap-1.5 text-xs overflow-y-auto ${
        isToday(date) 
          ? 'bg-blue-50/50' 
          : 'bg-white'
      } hover:shadow-inner`}
      style={{maxHeight: '180px'}}
    >
      {tasks.map(task => (
        <div key={task.id} className="flex items-center gap-1.5 p-1.5 bg-gray-100 rounded-md shadow-xs hover:bg-gray-200/70 transition-colors">
          {task.status === "Done" ? (
            <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
          ) : task.status === "Blocked" ? (
            <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0" />
          ) : (
            <Clock className="w-3 h-3 text-orange-600 flex-shrink-0" />
          )}
          <span className="text-gray-700 truncate" title={task.title}>{task.title}</span>
        </div>
      ))}

      {updates.map(update => (
        <div key={update.id} className="flex items-start gap-1.5 p-1.5 bg-indigo-50 rounded-md shadow-xs hover:bg-indigo-100/70 transition-colors">
          <MessageSquare className="w-3 h-3 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            {update.update_type && (
              <div className="text-indigo-800 font-medium text-[11px] leading-tight">{update.update_type}</div>
            )}
            <span className="text-indigo-700 truncate block leading-tight" title={update.update_text}>
              {update.update_text}
            </span>
          </div>
        </div>
      ))}

      {!hasActivity && (
        <div className="text-xs text-gray-400 italic m-auto">No activity</div>
      )}
    </motion.div>
  );
}