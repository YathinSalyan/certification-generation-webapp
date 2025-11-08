import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { participantsAPI, coursesAPI, credentialsAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    participants: 0,
    courses: 0,
    credentials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [participantsRes, coursesRes, credentialsRes] = await Promise.all([
          participantsAPI.getAll(),
          coursesAPI.getAll(),
          credentialsAPI.getAll(),
        ]);

        setStats({
          participants: participantsRes.data.length,
          courses: coursesRes.data.length,
          credentials: credentialsRes.data.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Participants',
      value: stats.participants,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Courses',
      value: stats.courses,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Certificates Issued',
      value: stats.credentials,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Completion Rate',
      value: stats.participants > 0 
        ? `${Math.round((stats.credentials / stats.participants) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your certificate management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/participants" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold">Add New Participant</h3>
              <p className="text-sm text-muted-foreground">Register a new student or professional</p>
            </a>
            <a href="/courses" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold">Create Course</h3>
              <p className="text-sm text-muted-foreground">Set up a new course or internship program</p>
            </a>
            <a href="/credentials" className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h3 className="font-semibold">Issue Certificate</h3>
              <p className="text-sm text-muted-foreground">Map participants to courses and generate certificates</p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Participant management</li>
                <li>✓ Course creation with custom templates</li>
                <li>✓ Dynamic PDF certificate generation</li>
                <li>✓ QR code validation</li>
                <li>✓ Secure credential verification</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;