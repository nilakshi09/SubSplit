import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, SplitSquareHorizontal, Users, AlertCircle } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';
import toast from 'react-hot-toast';

export function JoinGroupPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { joinGroup } = useGroups();

  const [status, setStatus] = useState<'idle' | 'joining' | 'success' | 'error' | 'already-member'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoin = async () => {
    if (!code) return;
    setStatus('joining');
    try {
      const result = await joinGroup(code);
      setStatus('success');
      toast.success(result.message || 'Joined the group!');
      setTimeout(() => {
        navigate(`/groups/${result.group.id}`);
      }, 1000);
    } catch (err: any) {
      const message = err?.message || 'Failed to join group';
      if (message.toLowerCase().includes('already')) {
        setStatus('already-member');
      } else {
        setStatus('error');
        setErrorMessage(message);
      }
    }
  };

  // Auto-attempt join on mount if user is likely authenticated
  useEffect(() => {
    // Don't auto-join — let the user click the button
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <SplitSquareHorizontal className="w-5 h-5 text-[#2D3748]" />
          </div>
          <span className="text-xl font-bold text-[#2D3748] tracking-tight">SubSplit</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xl text-center">
          {/* Idle state */}
          {status === 'idle' && (
            <>
              <div className="w-14 h-14 rounded-full bg-teal-500/15 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-[#16a34a]" />
              </div>
              <h1 className="text-[#2D3748] font-bold text-xl mb-2">You've been invited!</h1>
              <p className="text-[#718096] text-sm mb-6">
                Someone wants you to join their group on SubSplit to start splitting subscriptions together.
              </p>
              <button
                onClick={handleJoin}
                className="w-full py-3 rounded-xl text-sm font-semibold text-[#2D3748] bg-[#4ADE80] hover:bg-teal-400 transition-colors cursor-pointer"
              >
                Join Group
              </button>
              <p className="text-[#718096] text-xs mt-4">
                You'll need to sign in if you haven't already
              </p>
            </>
          )}

          {/* Joining state */}
          {status === 'joining' && (
            <>
              <div className="w-14 h-14 rounded-full bg-teal-500/15 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 text-[#16a34a] animate-spin" />
              </div>
              <h1 className="text-[#2D3748] font-bold text-xl mb-2">Joining…</h1>
              <p className="text-[#718096] text-sm">Hang tight, we're adding you to the group</p>
            </>
          )}

          {/* Success state */}
          {status === 'success' && (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h1 className="text-[#2D3748] font-bold text-xl mb-2">You're in!</h1>
              <p className="text-[#718096] text-sm">Redirecting you to the group…</p>
            </>
          )}

          {/* Already member */}
          {status === 'already-member' && (
            <>
              <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-amber-400" />
              </div>
              <h1 className="text-[#2D3748] font-bold text-xl mb-2">Already a member</h1>
              <p className="text-[#718096] text-sm mb-6">
                You're already in this group.
              </p>
              <button
                onClick={() => navigate('/groups')}
                className="w-full py-3 rounded-xl text-sm font-semibold text-[#2D3748] bg-[#4ADE80] hover:bg-teal-400 transition-colors cursor-pointer"
              >
                Go to My Groups
              </button>
            </>
          )}

          {/* Error state */}
          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <h1 className="text-[#2D3748] font-bold text-xl mb-2">Invalid invite</h1>
              <p className="text-[#718096] text-sm mb-6">
                {errorMessage || 'This invite link is invalid or has expired.'}
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleJoin}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-[#2D3748] bg-[#F1F5F4] hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-2 text-sm font-medium text-[#718096] hover:text-[#718096] transition-colors cursor-pointer"
                >
                  Go Home
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
