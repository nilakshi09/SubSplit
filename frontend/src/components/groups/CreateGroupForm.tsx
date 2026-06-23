import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useGroups } from '../../hooks/useGroups';
import toast from 'react-hot-toast';

interface CreateGroupFormProps {
  onClose: () => void;
  onSuccess: (group: any) => void;
}

const EMOJI_OPTIONS = ['👥', '🏠', '🎓', '💼', '🎮', '✈️', '🎵', '💪'];

export function CreateGroupForm({ onClose, onSuccess }: CreateGroupFormProps) {
  const { createGroup } = useGroups();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('👥');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const group = await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        emoji,
      });
      toast.success('Group created!');
      onSuccess(group);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#E2E8F0] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[#2D3748] font-bold text-xl">Create a Group</h2>
            <button
              onClick={onClose}
              className="text-[#718096] hover:text-[#2D3748] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Emoji picker */}
            <div>
              <label className="block text-sm font-medium text-[#718096] mb-2">
                Choose an emoji
              </label>
              <div className="flex items-center gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all cursor-pointer ${
                      emoji === e
                        ? 'bg-[#4ADE80]/20 border-2 border-teal-500 scale-110'
                        : 'bg-[#F7F7F5] border-2 border-transparent hover:bg-[#F1F5F4]'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div>
              <label htmlFor="group-name" className="block text-sm font-medium text-[#718096] mb-2">
                Group name
              </label>
              <input
                id="group-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. College Squad"
                maxLength={50}
                className="w-full bg-[#F7F7F5] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[#2D3748] placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-colors"
              />
            </div>

            {/* Description textarea */}
            <div>
              <label htmlFor="group-desc" className="block text-sm font-medium text-[#718096] mb-2">
                Description <span className="text-[#718096]">(optional)</span>
              </label>
              <textarea
                id="group-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group for?"
                rows={3}
                maxLength={200}
                className="w-full bg-[#F7F7F5] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[#2D3748] placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-colors resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#718096] hover:text-[#2D3748] bg-[#F7F7F5] hover:bg-[#F1F5F4] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#2D3748] bg-[#4ADE80] hover:bg-teal-400 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  'Create Group'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
