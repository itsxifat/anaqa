'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, GripVertical, Image as ImageIcon, X } from 'lucide-react';
import AdminPageWrapper from '../components/AdminPageWrapper';
import { savePageContent } from '@/actions/pages';

export default function PageEditor({ slug, initialData, title, subtitle }) {
  const [saving, setSaving] = useState(false);

  const [pageTitle, setPageTitle] = useState(initialData?.title || title);
  const [heroHeading, setHeroHeading] = useState(initialData?.heroHeading || '');
  const [heroSubheading, setHeroSubheading] = useState(initialData?.heroSubheading || '');
  const [existingHeroImage, setExistingHeroImage] = useState(initialData?.heroImage || '');
  const [heroImagePreview, setHeroImagePreview] = useState(initialData?.heroImage || '');
  const [heroImageFile, setHeroImageFile] = useState(null);

  const [sections, setSections] = useState(
    initialData?.sections?.length
      ? initialData.sections.sort((a, b) => a.order - b.order)
      : [{ heading: '', body: '', order: 0 }]
  );

  // Team members (About Us only)
  const [teamMembers, setTeamMembers] = useState(initialData?.teamMembers || []);

  const addSection = () => {
    setSections(prev => [...prev, { heading: '', body: '', order: prev.length }]);
  };

  const removeSection = (i) => {
    setSections(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateSection = (i, field, value) => {
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const addTeamMember = () => {
    setTeamMembers(prev => [...prev, { name: '', role: '', bio: '', image: '' }]);
  };

  const updateTeamMember = (i, field, value) => {
    setTeamMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const removeTeamMember = (i) => {
    setTeamMembers(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleHeroImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImageFile(file);
    setHeroImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('slug', slug);
    fd.append('title', pageTitle);
    fd.append('heroHeading', heroHeading);
    fd.append('heroSubheading', heroSubheading);
    fd.append('existingHeroImage', existingHeroImage);
    if (heroImageFile) fd.append('heroImage', heroImageFile);

    const numberedSections = sections.map((s, i) => ({ ...s, order: i }));
    fd.append('sections', JSON.stringify(numberedSections));
    fd.append('teamMembers', JSON.stringify(teamMembers));

    const result = await savePageContent(fd);
    if (result.success) {
      toast.success('Page saved successfully!');
      setHeroImageFile(null);
    } else {
      toast.error(result.error || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <AdminPageWrapper
      title={title}
      subtitle={subtitle}
      actions={
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors disabled:opacity-50 rounded-lg"
        >
          {saving ? 'Saving...' : 'Publish Changes'}
        </button>
      }
    >
      <div className="max-w-3xl space-y-6">

        {/* Page Title */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Page Title</label>
          <input
            value={pageTitle}
            onChange={e => setPageTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition"
            placeholder="Page title"
          />
        </div>

        {/* Hero Banner */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700">Hero Banner</h3>

          {/* Hero image */}
          {heroImagePreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-[3/1]">
              <img src={heroImagePreview} alt="Hero" className="w-full h-full object-cover" />
              <button
                onClick={() => { setHeroImagePreview(''); setExistingHeroImage(''); setHeroImageFile(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-600 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className="w-full aspect-[3/1] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#D4AF37] transition text-gray-400 hover:text-[#D4AF37]">
                <ImageIcon size={24} />
                <span className="text-xs font-semibold uppercase tracking-wider">Upload Hero Image</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleHeroImageChange} />
            </label>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Hero Heading</label>
            <input
              value={heroHeading}
              onChange={e => setHeroHeading(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition"
              placeholder="Who We Are"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Hero Subheading</label>
            <input
              value={heroSubheading}
              onChange={e => setHeroSubheading(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37] transition"
              placeholder="A short tagline or description"
            />
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700">Content Sections</h3>
            <button
              onClick={addSection}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:text-black transition"
            >
              <Plus size={14} /> Add Section
            </button>
          </div>
          <p className="text-xs text-gray-400">HTML is supported in the body field (e.g. &lt;strong&gt;, &lt;a&gt;, &lt;br&gt;)</p>

          {sections.map((section, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <GripVertical size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Section {i + 1}</span>
                </div>
                {sections.length > 1 && (
                  <button onClick={() => removeSection(i)} className="text-gray-300 hover:text-red-500 transition">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <input
                value={section.heading}
                onChange={e => updateSection(i, 'heading', e.target.value)}
                placeholder="Section heading (optional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37] transition"
              />
              <textarea
                value={section.body}
                onChange={e => updateSection(i, 'body', e.target.value)}
                placeholder="Section content — HTML supported"
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37] transition resize-y"
              />
            </div>
          ))}
        </div>

        {/* Team Members (About Us) */}
        {slug === 'about' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-700">Team Members</h3>
              <button
                onClick={addTeamMember}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:text-black transition"
              >
                <Plus size={14} /> Add Member
              </button>
            </div>
            {teamMembers.map((member, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Member {i + 1}</span>
                  <button onClick={() => removeTeamMember(i)} className="text-gray-300 hover:text-red-500 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={member.name}
                    onChange={e => updateTeamMember(i, 'name', e.target.value)}
                    placeholder="Full Name"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37] transition"
                  />
                  <input
                    value={member.role}
                    onChange={e => updateTeamMember(i, 'role', e.target.value)}
                    placeholder="Role / Title"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37] transition"
                  />
                </div>
                <input
                  value={member.image}
                  onChange={e => updateTeamMember(i, 'image', e.target.value)}
                  placeholder="Image URL or path"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37] transition"
                />
                <textarea
                  value={member.bio}
                  onChange={e => updateTeamMember(i, 'bio', e.target.value)}
                  placeholder="Short bio"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#D4AF37] transition resize-none"
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminPageWrapper>
  );
}
