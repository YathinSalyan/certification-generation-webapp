import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { credentialsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

const ValidationPage = () => {
  const { credentialId } = useParams();
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateCredential = async () => {
      try {
        const response = await credentialsAPI.validate(credentialId);
        if (response.data.valid) {
          setCredential(response.data.credential);
        } else {
          setError('Credential not found or invalid');
        }
      } catch (err) {
        setError('Failed to validate credential');
      } finally {
        setLoading(false);
      }
    };

    validateCredential();
  }, [credentialId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Validating certificate...</p>
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="mx-auto mb-4 text-red-500" size={64} />
            <CardTitle className="text-red-600">Invalid Certificate</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CheckCircle className="mx-auto mb-4" size={64} />
            <CardTitle className="text-3xl">Valid Certificate</CardTitle>
            <p className="text-blue-100 mt-2">This certificate has been verified</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Participant Name</h3>
                <p className="text-lg font-semibold">{credential.participant.fullName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Participant ID</h3>
                <p className="text-lg font-semibold font-mono">{credential.participant.participantId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Organization</h3>
                <p className="text-lg font-semibold">{credential.participant.organization}</p>
              </div>
              {credential.participant.classYear && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Class/Year</h3>
                  <p className="text-lg font-semibold">{credential.participant.classYear}</p>
                </div>
              )}
              {credential.participant.streamMajor && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Stream/Major</h3>
                  <p className="text-lg font-semibold">{credential.participant.streamMajor}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">Course Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Course Title</h3>
                  <p className="text-lg font-semibold text-blue-600">{credential.course.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
                  <p className="text-lg font-semibold">{credential.course.duration}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Issue Date</h3>
                  <p className="text-lg font-semibold">
                    {new Date(credential.issueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                  <p className="text-lg font-semibold">
                    {new Date(credential.course.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                  <p className="text-lg font-semibold">
                    {new Date(credential.course.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">Verification Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Credential ID</span>
                  <span className="font-mono text-sm font-semibold">{credential.credentialId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle size={16} className="mr-1" />
                    Active & Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 pt-4">
              <p>This certificate has been digitally verified and is authentic.</p>
              <p className="mt-1">Generated and managed by Certificate Management System</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ValidationPage;