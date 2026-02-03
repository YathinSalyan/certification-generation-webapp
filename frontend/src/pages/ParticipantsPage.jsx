import React, { useEffect, useState } from 'react';
import { participantsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const ParticipantsPage = () => {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    classYear: '',
    streamMajor: '',
    organization: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchParticipants();
  }, [search]);

  const fetchParticipants = async () => {
    try {
      const response = await participantsAPI.getAll(search);
      setParticipants(response.data);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await participantsAPI.update(editingId, formData);
      } else {
        await participantsAPI.create(formData);
      }
      fetchParticipants();
      resetForm();
    } catch (error) {
      alert('Failed to save participant');
    }
  };

  const handleEdit = (participant) => {
    setFormData({
      fullName: participant.fullName,
      classYear: participant.classYear || '',
      streamMajor: participant.streamMajor || '',
      organization: participant.organization,
      email: participant.email || '',
      phone: participant.phone || '',
    });
    setEditingId(participant.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      try {
        await participantsAPI.delete(id);
        fetchParticipants();
      } catch (error) {
        alert('Failed to delete participant');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      classYear: '',
      streamMajor: '',
      organization: '',
      email: '',
      phone: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Participants</h1>
          <p className="text-muted-foreground mt-2">Manage students and professionals</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" />
          Add Participant
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Add'} Participant</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Organization *</label>
                  <Input
                    value={formData.organization}
                    onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Class/Year</label>
                  <Input
                    value={formData.classYear}
                    onChange={(e) => setFormData({...formData, classYear: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stream/Major</label>
                  <Input
                    value={formData.streamMajor}
                    onChange={(e) => setFormData({...formData, streamMajor: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search participants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : participants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No participants found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Organization</th>
                    <th className="text-left p-3">Class/Major</th>
                    <th className="text-left p-3">Contact</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{participant.participantId}</td>
                      <td className="p-3 font-medium">{participant.fullName}</td>
                      <td className="p-3">{participant.organization}</td>
                      <td className="p-3">
                        {participant.classYear && participant.streamMajor
                          ? `${participant.classYear} - ${participant.streamMajor}`
                          : participant.classYear || participant.streamMajor || '-'}
                      </td>
                      <td className="p-3 text-sm">{participant.email || participant.phone || '-'}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(participant)}>
                            <Edit size={14} />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(participant.id)}>
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

export default ParticipantsPage;