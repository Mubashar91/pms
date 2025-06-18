import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

import  Project  from '@/entities/Project.json';
import teamData from "@/entities/Team.json"; // Use the correct path and casing
import userData from "@/Entities/User.json"; // ✅ Correct
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart, 
  ChevronsUpDown, 
  Calendar,
  User as UserIcon,
  Users,
  Hash,
  Link as LinkIcon,
  Milestone as MilestoneIcon,
  Check,
  PlusCircle,
  Trash2,
  X,
  Target,
  Flag
} from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { format } from "date-fns";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Dialog } from "@/components/ui/dialog";

const statuses = ["Backlog", "Planned", "In Progress", "Completed", "Cancelled"];
const priorities = ["Urgent", "High", "Medium", "Low"];
const initialTeamMemberState = { user_email: '', role: ''};
const CapsuleInput = ({ icon: Icon, label, value, children }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 h-8 text-gray-600 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="text-sm">{value || label}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-60 p-0">
      {children}
    </PopoverContent>
  </Popover>
);


const TagInput = ({ value = [], onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      event.preventDefault();
      onChange([...(value || []), inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) => {
    onChange((value || []).filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md">
      {(value || []).map((tag, index) => (
        <div key={index} className="flex items-center gap-1 bg-gray-200 rounded px-2 py-0.5">
          <span className="text-sm">{tag}</span>
          <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-gray-800">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-grow bg-transparent outline-none text-sm"
      />
    </div>
  );
};

export default function ProjectForm({ project: existingProject, onSubmitSuccess, onCancel, users }) {
  const [project, setProject] = useState(existingProject || { 
    title: '', 
    description: '', 
    status: 'Backlog', 
    priority: 'Medium', 
    team_id: '',
    team_members: [initialTeamMemberState], 
    labels: [], 
    initiatives: [],
    goals: [],
    dependencies: [],
    start_date: '',
    end_date: ''
  });
  const [teams, setTeams] = useState([]);
  const [milestones, setMilestones] = useState([{ title: '', description: '', due_date: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setTeams(teamData); // Use the imported JSON data directly
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  const handleChange = (field, value) => setProject(prev => ({ ...prev, [field]: value }));

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...(project.team_members || [])];
    newMembers[index] = { ...newMembers[index], [field]: value };
    handleChange('team_members', newMembers);
  };

  const handleAddMember = () => {
    const newMembers = [...(project.team_members || []), initialTeamMemberState];
    handleChange('team_members', newMembers);
  };

  const handleRemoveMember = (index) => {
    const newMembers = (project.team_members || []).filter((_, i) => i !== index);
    handleChange('team_members', newMembers);
  };

  const handleMilestoneChange = (index, field, value) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', due_date: '' }]);
  };

  const handleRemoveMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project.title || !project.team_id) return;
    
    setIsLoading(true);
    try {
      const createdProject = project.id 
        ? await Project.update(project.id, project)
        : await Project.create(project);
      
      const validMilestones = milestones.filter(m => m.title.trim() && m.due_date);
      if (validMilestones.length > 0) {
        const { Milestone } = await import('@/entities/Milestone');
        const projectId = project.id || createdProject.id;
        await Promise.all(
          validMilestones.map(milestone =>
            Milestone.create({ ...milestone, project_id: projectId })
          )
        );
      }
      
      onSubmitSuccess();
    } catch (error) {
      console.error("Error saving project:", error);
    }
    setIsLoading(false);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-h-[90vh] overflow-y-auto"
    >
      <Button onClick={() => setOpen(true)} variant="outline" className="mb-4">
        Create Project
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 mb-6">
            <BarChart className="w-6 h-6 text-blue-600" />
            <Input
              placeholder="Project name"
              value={project.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="text-lg font-medium border-none shadow-none focus-visible:ring-0 p-0 text-gray-900"
            />
          </div>
          
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <CapsuleInput icon={Users} label="Team" value={teams.find(t => t.id === project.team_id)?.name}>
              <Command>
                <CommandInput placeholder="Search teams..." />
                <CommandEmpty>No team found.</CommandEmpty>
                <CommandGroup>
                  {teams.map(team => (
                    <CommandItem key={team.id} onSelect={() => { handleChange('team_id', team.id); document.body.click(); }}>
                      <Check className={`mr-2 h-4 w-4 ${project.team_id === team.id ? "opacity-100" : "opacity-0"}`} />
                      <span className="mr-2">{team.icon}</span>
                      {team.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </CapsuleInput>

            <CapsuleInput icon={ChevronsUpDown} label="Status" value={project.status}>
              <Command>
                <CommandGroup>
                  {statuses.map(s => (
                    <CommandItem key={s} onSelect={() => { handleChange('status', s); document.body.click(); }}>
                      <Check className={`mr-2 h-4 w-4 ${project.status === s ? "opacity-100" : "opacity-0"}`} />
                      {s}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </CapsuleInput>
            
            <CapsuleInput icon={ChevronsUpDown} label="Priority" value={project.priority}>
              <Command>
                <CommandGroup>
                  {priorities.map(p => (
                    <CommandItem key={p} onSelect={() => { handleChange('priority', p); document.body.click(); }}>
                      <Check className={`mr-2 h-4 w-4 ${project.priority === p ? "opacity-100" : "opacity-0"}`} />
                      {p}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </CapsuleInput>

            <CapsuleInput icon={UserIcon} label="Lead" value={users.find(u => u.email === project.lead_email)?.full_name.split(' ')[0]}>
              <Command>
                <CommandInput placeholder="Search lead..." />
                <CommandEmpty>No user found.</CommandEmpty>
                <CommandGroup>
                  {users.map(u => (
                    <CommandItem key={u.id} onSelect={() => { handleChange('lead_email', u.email); document.body.click(); }}>
                      <Check className={`mr-2 h-4 w-4 ${project.lead_email === u.email ? "opacity-100" : "opacity-0"}`} />
                      {u.full_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </CapsuleInput>

            <CapsuleInput icon={Users} label="Members" value={(project.team_members || []).length ? `${(project.team_members || []).length} members` : ''}>
              <div className="p-3 space-y-3">
                <p className="text-xs font-medium text-gray-500 px-1">Assign members</p>
                {(project.team_members || []).map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      placeholder="user@email.com" 
                      value={member.user_email} 
                      onChange={(e) => handleMemberChange(index, 'user_email', e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Input 
                      placeholder="Role" 
                      value={member.role}
                      onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => handleRemoveMember(index)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500"/>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-1" onClick={handleAddMember}>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add member
                </Button>
              </div>
            </CapsuleInput>
            
            <CapsuleInput icon={Calendar} label="Dates" value={project.start_date && project.end_date ? `${format(new Date(project.start_date), "MMM d")} - ${format(new Date(project.end_date), "MMM d")}` : ''}>
              <div className="p-3 space-y-3">
                <CalendarPicker 
                  mode="range" 
                  onSelect={(range) => {
                    handleChange('start_date', range?.from);
                    handleChange('end_date', range?.to);
                  }}
                  selected={{
                    from: project.start_date ? new Date(project.start_date) : undefined,
                    to: project.end_date ? new Date(project.end_date) : undefined
                  }}
                />
              </div>
            </CapsuleInput>
          </div>

          <Textarea
            placeholder="Write a description, a project brief, or collect ideas..."
            value={project.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="min-h-32 border-gray-200 mb-6"
          />

          <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                   <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-purple-600"/> Initiatives</label>
                   <TagInput value={project.initiatives || []} onChange={v => handleChange('initiatives', v)} placeholder="Add initiative and press Enter"/>
              </div>
               <div>
                   <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Flag className="w-4 h-4 text-orange-600"/> Goals</label>
                   <TagInput value={project.goals || []} onChange={v => handleChange('goals', v)} placeholder="Add goal and press Enter"/>
              </div>
          </div>

          {/* Milestones Section */}
          <Card className="mb-6 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-purple-800">
                <div className="flex items-center gap-2">
                  <MilestoneIcon className="w-5 h-5" />
                  Milestones
                </div>
                <Button variant="ghost" size="sm" onClick={handleAddMilestone} className="text-purple-600 hover:text-purple-800">
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
                  <Input
                    placeholder="Milestone title"
                    value={milestone.title}
                    onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                    className="flex-1 h-8"
                  />
                  <Input
                    type="date"
                    value={milestone.due_date}
                    onChange={(e) => handleMilestoneChange(index, 'due_date', e.target.value)}
                    className="w-40 h-8"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 text-red-500 hover:text-red-700" 
                    onClick={() => handleRemoveMilestone(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {milestones.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <MilestoneIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No milestones added yet</p>
                  <Button variant="ghost" size="sm" onClick={handleAddMilestone} className="mt-2 text-purple-600">
                    Add your first milestone
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !project.title || !project.team_id} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
            >
              {isLoading ? 'Creating...' : (project.id ? 'Update Project' : 'Create Project')}
            </Button>
          </div>
        </form>
      </Dialog>
    </motion.div>
  );
}