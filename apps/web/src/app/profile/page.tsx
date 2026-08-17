'use client';

import { useState } from 'react';
import { MapPin, Link2, BadgeCheck, Rocket } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/lib/enums';
import { mockStartups } from '@/lib/data';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { success } = useToast();
  const isFounder = user?.role === UserRole.FOUNDER;

  const [name, setName] = useState(user?.founderProfile?.name ?? '');
  const [bio, setBio] = useState(user?.founderProfile?.bio ?? '');
  const [location, setLocation] = useState(user?.founderProfile?.location ?? '');
  const [experience, setExperience] = useState(user?.founderProfile?.experience ?? '');
  const [linkedin, setLinkedin] = useState(user?.founderProfile?.links?.linkedin ?? '');
  const [twitter, setTwitter] = useState(user?.founderProfile?.links?.twitter ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateUser({
      ...user,
      founderProfile: user.founderProfile
        ? {
            ...user.founderProfile,
            name,
            bio,
            location,
            experience,
            links: { linkedin, twitter },
            completeness: 95,
          }
        : undefined,
    });
    success('Profile updated successfully');
  };

  const profileName = user?.founderProfile?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">My Profile</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div>
          <Card className="p-6 text-center">
            <Avatar name={profileName} size="xl" className="mx-auto mb-4" />
            <h2 className="text-xl font-bold text-neutral-900 mb-1">{profileName}</h2>
            <p className="text-sm text-neutral-500 mb-3">{user?.email}</p>
            <Badge variant="verified" className="mb-4">
              <BadgeCheck className="h-3 w-3 mr-1" />
              Verified
            </Badge>
            <div className="flex flex-col gap-2 text-sm text-neutral-500 text-left">
              {location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary-500">
                  <Link2 className="h-4 w-4" />
                  LinkedIn
                </a>
              )}
            </div>
          </Card>

          {isFounder && (
            <Card className="p-6 mt-6">
              <CardHeader title="My Startups" />
              <div className="space-y-3">
                {mockStartups.slice(0, 2).map((startup) => (
                  <div key={startup.id} className="flex items-center gap-3">
                    <Avatar name={startup.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{startup.name}</p>
                      <p className="text-xs text-neutral-500">{startup.sector}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <CardHeader title={isFounder ? 'Founder Profile' : 'Investor Profile'} />
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
              <Textarea
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself"
                rows={4}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                />
                {isFounder && (
                  <Input
                    label="Experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Years of experience"
                  />
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn URL"
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
                <Input
                  label="Twitter URL"
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
                <Button type="submit">
                  <Rocket className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}