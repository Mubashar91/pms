import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import User from '@/entities/User.json';
import Project from '@/entities/Project.json';
import Task from '@/entities/Task.json';
import TeamData from '@/entities/Team.json';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Mail, Briefcase, Users, Folder, ListChecks, TrendingUp, Circle, CheckCircle, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

const priorityConfig = {
  'Low': { color: 'bg-blue-500' },
  'Medium': { color: 'bg-yellow-500' },
  'High': { color: 'bg-orange-500' },
  'Critical': { color: 'bg-red-500' },
};

const statusConfig = {
    'Todo': { icon: Circle, color: 'text-gray-500' },
    'In Progress': { icon: TrendingUp, color: 'text-blue-500' },
    'Review': { icon: AlertCircle, color: 'text-purple-500' },
    'Done': { icon: CheckCircle, color: 'text-green-500' },
};

export default function MemberProfile() {
    const [member, setMember] = useState(null);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();
    const email = new URLSearchParams(location.search).get('email');

    useEffect(() => {
        if (email) {
            loadMemberData();
        } else {
            setIsLoading(false);
        }
    }, [email]);

    const loadMemberData = async () => {
        setIsLoading(true);
        try {
            // Since we're using static JSON data, we'll just set the data directly
            const allUsers = Array.isArray(User) ? User : [];
            const allProjects = Array.isArray(Project) ? Project : [];
            const allTasks = Array.isArray(Task) ? Task : [];
            const allTeams = Array.isArray(TeamData) ? TeamData : [];

            const memberData = allUsers.find(u => u.email === email);
            if (!memberData) {
              setMember({ email, full_name: email.split('@')[0].replace('.', ' ') });
            } else {
              setMember(memberData);
            }
            
            const memberProjects = allProjects.filter(p =>
                p.team_members?.some(m => m.user_email === email)
            );
            setProjects(memberProjects);

            const memberTasks = allTasks.filter(t => t.assignee_email === email);
            setTasks(memberTasks);
            
            const memberTeams = allTeams.filter(team => 
                memberProjects.some(p => p.team_id === team.id)
            );
            setTeams(memberTeams);

        } catch (error) {
            console.error("Error loading member data:", error);
        }
        setIsLoading(false);
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '...';
    };

    const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'Done').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) : 0,
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading profile...</div>;
    }

    if (!member) {
        return <div className="p-6 text-center">Member not found.</div>;
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Button onClick={() => navigate(createPageUrl('Team'))} variant="outline" className="gap-2 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Team
            </Button>

            {/* Profile Header */}
            <Card className="border-0 shadow-lg glass-card">
                <CardContent className="p-6 flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-4xl" style={{backgroundColor: `hsl(${email.length * 10 % 360}, 60%, 70%)`, color: 'white'}}>
                            {getInitials(member.full_name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{member.full_name}</h1>
                        <div className="flex items-center gap-4 text-gray-600 mt-2">
                            <div className="flex items-center gap-2"><Mail className="w-4 h-4"/>{member.email}</div>
                            <div className="flex items-center gap-2"><Briefcase className="w-4 h-4"/>Software Engineer</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Folder className="w-5 h-5 text-blue-600"/>Projects</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-4xl font-bold">{projects.length}</p></CardContent>
                </Card>
                <Card className="border-0 shadow-lg glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><ListChecks className="w-5 h-5 text-purple-600"/>Tasks</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-4xl font-bold">{taskStats.total}</p></CardContent>
                </Card>
                <Card className="border-0 shadow-lg glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="w-5 h-5 text-green-600"/>Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-4xl font-bold">{taskStats.completionRate}%</p>
                        <Progress value={taskStats.completionRate} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Projects Card */}
                <Card className="border-0 shadow-lg glass-card">
                    <CardHeader>
                        <CardTitle>Active Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {projects.map(project => (
                                <div key={project.id} className="p-3 border rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{project.title}</p>
                                        <Badge variant="outline" className="mt-1">{project.status}</Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">{project.progress || 0}%</p>
                                        <Progress value={project.progress || 0} className="w-24 mt-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Teams Card */}
                <Card className="border-0 shadow-lg glass-card">
                    <CardHeader>
                        <CardTitle>Teams</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {teams.map(team => (
                                <Badge key={team.id} className="text-base p-2">
                                    <span className="mr-2">{team.icon}</span>
                                    {team.name}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tasks Table */}
            <Card className="border-0 shadow-lg glass-card">
                <CardHeader>
                    <CardTitle>Assigned Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Due Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map(task => {
                                const StatusIcon = statusConfig[task.status]?.icon || Circle;
                                const project = projects.find(p => p.id === task.project_id);
                                return (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>{project?.title || 'N/A'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon className={`w-4 h-4 ${statusConfig[task.status]?.color}`} />
                                            {task.status}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${priorityConfig[task.priority]?.color || 'bg-gray-400'}`}></div>
                                            {task.priority}
                                        </div>
                                    </TableCell>
                                    <TableCell>{task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
