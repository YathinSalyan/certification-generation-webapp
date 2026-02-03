import React, { useEffect, useState } from 'react';
import { coursesAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .certificate {
      width: 297mm;
      height: 210mm;
      background: white;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .border { border: 3px solid #667eea; padding: 30px; height: 100%; }
    .inner-border {
      border: 1px solid #764ba2;
      padding: 40px;
      height: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .title {
      font-size: 48px;
      color: #667eea;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .name {
      font-size: 42px;
      color: #764ba2;
      font-weight: bold;
      margin: 20px 0;
      border-bottom: 2px solid #667eea;
      display: inline-block;
      padding: 10px 40px;
    }
    .course-title {
      font-size: 28px;
      color: #667eea;
      font-weight: bold;
      margin: 15px 0;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 30px;
    }
    .qr-code { width: 120px; height: 120px; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border">
      <div class="inner-border">
        <div>
          <div class="title">Certificate of Completion</div>
        </div>
        <div>
          <div class="name">{{PARTICIPANT_NAME}}</div>
          <p>has successfully completed the</p>
          <div class="course-title">{{COURSE_TITLE}}</div>
          <p>Duration: {{DURATION}}</p>
          <p>{{START_DATE}} to {{END_DATE}}</p>
        </div>
        <div class="footer">
          <div>
            <p><strong>Organization:</strong> {{ORGANIZATION}}</p>
            <p><strong>Issue Date:</strong> {{ISSUE_DATE}}</p>
          </div>
          <div>
            <img src="{{QR_CODE}}" class="qr-code">
            <p style="font-size: 12px; font-family: monospace;">{{CREDENTIAL_ID}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    startDate: '',
    endDate: '',
    description: '',
    template: DEFAULT_TEMPLATE,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await coursesAPI.update(editingId, formData);
      } else {
        await coursesAPI.create(formData);
      }
      fetchCourses();
      resetForm();
    } catch (error) {
      alert('Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setFormData({
      title: course.title,
      duration: course.duration,
      startDate: new Date(course.startDate).toISOString().split('T')[0],
      endDate: new Date(course.endDate).toISOString().split('T')[0],
      description: course.description || '',
      template: course.template,
    });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete all associated credentials.')) {
      try {
        await coursesAPI.delete(id);
        fetchCourses();
      } catch (error) {
        alert('Failed to delete course');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      duration: '',
      startDate: '',
      endDate: '',
      description: '',
      template: DEFAULT_TEMPLATE,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-2">Manage courses and internship programs</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" />
          Add Course
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Add'} Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Web Development Internship"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration *</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 4 weeks"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date *</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date *</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Course description..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Certificate Template (HTML) *</label>
                <textarea
                  className="w-full p-2 border rounded-md font-mono text-sm"
                  rows="10"
                  value={formData.template}
                  onChange={(e) => setFormData({...formData, template: e.target.value})}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available placeholders: {`{{PARTICIPANT_NAME}}, {{COURSE_TITLE}}, {{DURATION}}, {{START_DATE}}, {{END_DATE}}, {{ORGANIZATION}}, {{QR_CODE}}, {{CREDENTIAL_ID}}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-8">No courses found</p>
        ) : (
          courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Duration:</strong> {course.duration}</p>
                  <p><strong>Start:</strong> {new Date(course.startDate).toLocaleDateString()}</p>
                  <p><strong>End:</strong> {new Date(course.endDate).toLocaleDateString()}</p>
                  {course.description && <p className="text-muted-foreground">{course.description}</p>}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(course)} className="flex-1">
                    <Edit size={14} className="mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(course.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CoursesPage;