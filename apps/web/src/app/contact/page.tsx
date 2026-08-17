'use client';

import { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function ContactPage() {
  const { success } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', message: '' });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">Contact Us</h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Have questions about FundrHub? We'd love to hear from you. Reach out and we'll
          get back to you as soon as possible.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 h-full">
            <CardHeader title="Get in Touch" subtitle="We're here to help" />
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="p-3 rounded-xl bg-primary-50 text-primary-500">
                  <Mail className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Email</h3>
                  <a
                    href="mailto:Singhashu772@gmail.com"
                    className="text-primary-500 hover:text-primary-600"
                  >
                    Singhashu772@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="p-3 rounded-xl bg-success-50 text-success-500">
                  <Phone className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Phone / WhatsApp</h3>
                  <a
                    href="tel:+917042579843"
                    className="text-primary-500 hover:text-primary-600"
                  >
                    +91 70425 79843
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="p-3 rounded-xl bg-secondary-50 text-secondary-500">
                  <MessageCircle className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">WhatsApp</h3>
                  <a
                    href="https://wa.me/917042579843"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-600"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="p-3 rounded-xl bg-warning-50 text-warning-500">
                  <MapPin className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Founder</h3>
                  <p className="text-neutral-600">Ashutosh Singh</p>
                  <p className="text-sm text-neutral-500">Founder & Product Owner, FundrHub</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <CardHeader title="Send a Message" subtitle="We typically respond within 24 hours" />
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
                required
              />
              <Input
                label="Your Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
              <Textarea
                label="Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us how we can help..."
                rows={5}
                required
              />
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}