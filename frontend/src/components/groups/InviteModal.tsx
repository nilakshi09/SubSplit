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
          className="bg-white rounded-2xl p-6 w-full max-w-md border border-[#E2E8F0] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#2D3748] font-bold text-xl">Invite to {groupName}</h2>
            <button
              onClick={onClose}
              className="text-[#718096] hover:text-[#2D3748] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[#718096] text-sm mb-6">
            Share this link with your friends to join the group
          </p>

          {/* Invite link input */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 bg-[#F7F7F5] border border-[#E2E8F0] rounded-lg px-3 py-2.5 min-w-0">
              <LinkIcon className="w-4 h-4 text-[#718096] flex-shrink-0" />
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-transparent text-sm text-[#718096] outline-none min-w-0 truncate"
              />
            </div>
            <button
              onClick={handleCopy}
              disabled={!inviteUrl}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer flex-shrink-0 ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#4ADE80] hover:bg-teal-400 text-[#2D3748]'
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
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-[#718096] hover:text-[#2D3748] bg-[#F7F7F5] hover:bg-[#F1F5F4] transition-colors cursor-pointer disabled:opacity-50"
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
