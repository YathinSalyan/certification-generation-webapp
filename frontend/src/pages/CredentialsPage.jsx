import React, { useEffect, useState } from 'react';
import { credentialsAPI, participantsAPI, coursesAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Download, Trash2, ExternalLink } from 'lucide-react';

const CredentialsPage = () => {
  const [credentials, setCredentials] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    participantId: '',
    courseId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [credRes, partRes, courseRes] = await Promise.all([
        credentialsAPI.getAll(),
        participantsAPI.getAll(),
        coursesAPI.getAll(),
      ]);
      setCredentials(credRes.data);
      setParticipants(partRes.data);
      setCourses(courseRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await credentialsAPI.create(formData);
      fetchData();
      setShowForm(false);
      setFormData({ participantId: '', courseId: '' });
    } catch (error) {
      alert('Failed to create credential');
    }
  };

  const handleDownload = async (id, credentialId) => {
    try {
      const response = await credentialsAPI.generateCertificate(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${credentialId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to generate certificate');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        await credentialsAPI.delete(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete credential');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Credentials</h1>
          <p className="text-muted-foreground mt-2">Issue and manage certificates</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" />
          Issue Certificate
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Issue New Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Participant *</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.participantId}
                  onChange={(e) => setFormData({...formData, participantId: e.target.value})}
                  required
                >
                  <option value="">Select Participant</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} - {p.organization}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Course *</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.courseId}
                  onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Issue Certificate</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Issued Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : credentials.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No certificates issued yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Credential ID</th>
                    <th className="text-left p-3">Participant</th>
                    <th className="text-left p-3">Course</th>
                    <th className="text-left p-3">Issue Date</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((cred) => (
                    <tr key={cred.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs">{cred.credentialId}</td>
                      <td className="p-3">{cred.participant?.fullName || 'N/A'}</td>
                      <td className="p-3">{cred.course?.title || 'N/A'}</td>
                      <td className="p-3">{new Date(cred.issueDate).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/validate/${cred.credentialId}`, '_blank')}
                          >
                            <ExternalLink size={14} />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(cred.id, cred.credentialId)}
                          >
                            <Download size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(cred.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CredentialsPage;