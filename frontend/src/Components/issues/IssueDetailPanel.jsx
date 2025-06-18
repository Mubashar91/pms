import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

import { Issue } from '@/entities/Issue';
import { IssueComment } from '@/entities/IssueComment';
import { Activity } from '@/entities/Activity';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, formatDistanceToNow } from 'date-fns';
import { 
  X, 
  Send,
  Calendar as CalendarIcon,
  Tag,
  Flag,
  User as UserIcon,
  CheckCircle,
  Paperclip,
  Trash2
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const priorityOptions = ["Low", "Medium", "High", "Critical"];
const statusOptions = ["Backlog", "Planned", "In Progress", "Review", "Testing", "Done", "Cancelled"];
const typeOptions = ["Bug", "Feature", "Task", "Improvement", "Epic", "Story"];

export default function IssueDetailPanel({ issueId, onClose, onUpdate, projects, users }) {
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
 // eslint-disable-next-line no-unused-vars
const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState('');
  const [isNewIssue, setIsNewIssue] = useState(false);

  useEffect(() => {
    if (issueId) {
      if (issueId === 'new') {
        setIsNewIssue(true);
        setIssue({
          title: '',
          description: '',
          project_id: '',
          status: 'Backlog',
          priority: 'Medium',
          type: 'Task',
          assignee_email: '',
          due_date: null,
          labels: [],
        });
        setComments([]);
        setActivities([]);
      } else {
        setIsNewIssue(false);
        loadIssueDetails(issueId);
      }
    }
  }, [issueId]);

  const loadIssueDetails = async (id) => {
    try {
      const [issueData, commentsData, activityData] = await Promise.all([
        Issue.list().then(issues => issues.find(i => i.id === id)),
        IssueComment.filter({ issue_id: id }, "-created_date"),
        Activity.filter({ related_entity_id: id }, "-created_date"),
      ]);
      setIssue(issueData);
      setDescriptionContent(issueData?.description || '');
      setComments(commentsData);
      setActivities(activityData);
    } catch (error) {
      console.error("Failed to load issue details:", error);
    }
  };

  const handleFieldUpdate = async (field, value) => {
    if (!issue || isNewIssue) {
        setIssue(prev => ({...prev, [field]: value}));
        return;
    }
    
    try {
      await Issue.update(issue.id, { [field]: value });
      setIssue(prev => ({ ...prev, [field]: value }));
      // Add activity log
      const currentUser = await User.me();
      await Activity.create({
          project_id: issue.project_id,
          related_entity_id: issue.id,
          description: `${currentUser.full_name} updated ${field} to ${value}`
      });
      onUpdate();
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };
  
  const handleDescriptionSave = async () => {
      await handleFieldUpdate('description', descriptionContent);
      setIsEditingDescription(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !issue || isNewIssue) return;
    try {
      await IssueComment.create({
        issue_id: issue.id,
        content: newComment,
        author_email: (await User.me()).email,
      });
      setNewComment('');
      loadIssueDetails(issue.id);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleCreateIssue = async () => {
      if (!issue.title || !issue.project_id) {
          alert("Title and project are required.");
          return;
      }
      try {
          await Issue.create(issue);
          onUpdate();
          onClose();
      } catch (error) {
          console.error("Failed to create issue:", error);
      }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <AnimatePresence>
      {issueId && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
          className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl border-l z-50 flex flex-col"
        >
          {issue ? (
            <>
              <header className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Select value={issue.project_id} onValueChange={(v) => handleFieldUpdate('project_id', v)}>
                        <SelectTrigger className="w-auto border-none shadow-none text-gray-500">
                            <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </header>

              <div className="flex-1 overflow-y-auto p-6">
                <Input
                  placeholder="Issue title"
                  value={issue.title}
                  onChange={(e) => setIssue(prev => ({...prev, title: e.target.value}))}
                  onBlur={(e) => handleFieldUpdate('title', e.target.value)}
                  className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 p-0 mb-4"
                  disabled={!isNewIssue && !issue}
                />
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                    <div className="flex items-center gap-4">
                        <span className="w-24 text-gray-500 text-sm">Status</span>
                        <Select value={issue.status} onValueChange={(v) => handleFieldUpdate('status', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center gap-4">
                        <span className="w-24 text-gray-500 text-sm">Assignee</span>
                        <Select value={issue.assignee_email} onValueChange={(v) => handleFieldUpdate('assignee_email', v)}>
                            <SelectTrigger>
                               <SelectValue placeholder="Unassigned"/>
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(u => <SelectItem key={u.id} value={u.email}>{u.full_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center gap-4">
                        <span className="w-24 text-gray-500 text-sm">Priority</span>
                         <Select value={issue.priority} onValueChange={(v) => handleFieldUpdate('priority', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>{priorityOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center gap-4">
                        <span className="w-24 text-gray-500 text-sm">Type</span>
                         <Select value={issue.type} onValueChange={(v) => handleFieldUpdate('type', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>{typeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="w-24 text-gray-500 text-sm">Due Date</span>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {issue.due_date ? format(new Date(issue.due_date), 'PPP') : "Set date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <CalendarPicker
                                    mode="single"
                                    selected={issue.due_date ? new Date(issue.due_date) : null}
                                    onSelect={(date) => handleFieldUpdate('due_date', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <h3 className="font-semibold mb-2">Description</h3>
                {isEditingDescription ? (
                    <div>
                        <ReactQuill theme="snow" value={descriptionContent} onChange={setDescriptionContent} />
                        <div className="flex justify-end gap-2 mt-2">
                           <Button variant="outline" onClick={() => setIsEditingDescription(false)}>Cancel</Button>
                           <Button onClick={handleDescriptionSave}>Save</Button>
                        </div>
                    </div>
                ) : (
                    <div onClick={() => setIsEditingDescription(true)} className="prose max-w-none p-2 rounded-lg hover:bg-gray-100 cursor-pointer min-h-[50px]">
                        <div dangerouslySetInnerHTML={{ __html: issue.description || "<p>Add a description...</p>" }} />
                    </div>
                )}
                
                <h3 className="font-semibold mt-6 mb-2">Comments</h3>
                <div className="space-y-4">
                    {comments.map(comment => {
                         const author = users.find(u => u.email === comment.author_email);
                         return (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar><AvatarFallback>{author ? getInitials(author.full_name) : '?'}</AvatarFallback></Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{author?.full_name}</span>
                                        <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-sm bg-gray-100 p-2 rounded-lg">{comment.content}</p>
                                </div>
                            </div>
                         )
                    })}
                </div>
                
                 <div className="flex gap-3 mt-4">
                    <Avatar><AvatarFallback>You</AvatarFallback></Avatar>
                    <div className="flex-1">
                        <Textarea placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                        <Button onClick={handleAddComment} className="mt-2" disabled={!newComment.trim() || isNewIssue}>Send</Button>
                    </div>
                 </div>
              </div>

              <footer className="p-4 border-t flex justify-end">
                {isNewIssue ? (
                    <Button onClick={handleCreateIssue}>Create Issue</Button>
                ) : (
                    <Button variant="destructive">Delete Issue</Button>
                )}
              </footer>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Loading issue...</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}