import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, RefreshCw, Loader2, Link as LinkIcon } from 'lucide-react';
import { useGroups } from '../../hooks/useGroups';
import toast from 'react-hot-toast';

interface InviteModalProps {
  groupId: string;
  groupName: string;
  inviteCode?: string;
  onClose: () => void;
}

export function InviteModal({ groupId, groupName, inviteCode: initialCode, onClose }: InviteModalProps) {
  const { generateInvite } = useGroups();
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setInviteUrl(`${window.location.origin}/join/${initialCode}`);
    } else {
      handleGenerate();
    }
  }, [initialCode]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const data = await generateInvite(groupId);
      setInviteUrl(data.inviteUrl || `${window.location.origin}/join/${data.inviteCode}`);
      toast.success('New invite link generated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate invite');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
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
          className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white font-bold text-xl">Invite to {groupName}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            Share this link with your friends to join the group
          </p>

          {/* Invite link input */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 min-w-0">
              <LinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-transparent text-sm text-gray-300 outline-none min-w-0 truncate"
              />
            </div>
            <button
              onClick={handleCopy}
              disabled={!inviteUrl}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex-shrink-0 ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-teal-500 hover:bg-teal-400 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Generate new link */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating…' : 'Generate New Link'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
