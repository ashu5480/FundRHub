'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Rocket } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input, Textarea, Select } from '@/components/ui/input';
import { SECTOR_OPTIONS, STAGE_LABELS } from '@/lib/data';
import { StartupStage } from '@/lib/enums';

export default function CreateStartupPage() {
  const router = useRouter();
  const { success } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    problem: '',
    solution: '',
    sector: '',
    stage: StartupStage.SEED,
    location: '',
    businessModel: '',
    amountSought: '',
    valuation: '',
    equityOffered: '',
    useOfFunds: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      success('Startup created successfully!');
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-500 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create Startup</h1>
      <p className="text-neutral-500 mb-8">Tell investors about your startup and fundraising needs</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <CardHeader title="Startup Details" subtitle="Step 1 of 3" />
          <div className="space-y-4">
            <Input
              label="Startup Name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., FundrHub"
              required
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What does your startup do?"
              rows={3}
              required
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Sector"
                options={SECTOR_OPTIONS.map((s) => ({ value: s, label: s }))}
                value={form.sector}
                onChange={(e) => handleChange('sector', e.target.value)}
                required
              />
              <Select
                label="Stage"
                options={Object.values(StartupStage).map((s) => ({ value: s, label: STAGE_LABELS[s] }))}
                value={form.stage}
                onChange={(e) => handleChange('stage', e.target.value)}
                required
              />
            </div>
            <Input
              label="Location"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="City, Country"
            />
            <Textarea
              label="Problem"
              value={form.problem}
              onChange={(e) => handleChange('problem', e.target.value)}
              placeholder="What problem are you solving?"
              rows={2}
            />
            <Textarea
              label="Solution"
              value={form.solution}
              onChange={(e) => handleChange('solution', e.target.value)}
              placeholder="How do you solve it?"
              rows={2}
            />
            <Textarea
              label="Business Model"
              value={form.businessModel}
              onChange={(e) => handleChange('businessModel', e.target.value)}
              placeholder="How does your startup make money?"
              rows={2}
            />
          </div>
        </Card>

        {/* Funding */}
        <Card className="p-6">
          <CardHeader title="Fundraising Details" subtitle="Step 2 of 3" />
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Amount Seeking ($)"
                type="number"
                value={form.amountSought}
                onChange={(e) => handleChange('amountSought', e.target.value)}
                placeholder="500000"
                required
              />
              <Input
                label="Valuation ($)"
                type="number"
                value={form.valuation}
                onChange={(e) => handleChange('valuation', e.target.value)}
                placeholder="5000000"
              />
              <Input
                label="Equity Offered (%)"
                type="number"
                value={form.equityOffered}
                onChange={(e) => handleChange('equityOffered', e.target.value)}
                placeholder="10"
              />
            </div>
            <Textarea
              label="Use of Funds"
              value={form.useOfFunds}
              onChange={(e) => handleChange('useOfFunds', e.target.value)}
              placeholder="How will you use the raised funds?"
              rows={2}
            />
          </div>
        </Card>

        {/* Submit */}
        <Card className="p-6">
          <CardHeader title="Review & Submit" subtitle="Step 3 of 3" />
          <p className="text-sm text-neutral-500 mb-4">
            Your startup will be reviewed by our team before being published to investors.
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary">
              Save as Draft
            </Button>
            <Button type="submit" isLoading={isLoading}>
              <Rocket className="h-4 w-4" />
              Submit for Review
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}