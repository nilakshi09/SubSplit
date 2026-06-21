export type RiskLevel = 'low' | 'medium' | 'high'
export type ScanStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type Platform = 'instagram' | 'youtube'
export type DataQuality = 'full' | 'partial' | 'limited'

export interface ScanProfile {
  displayName: string
  followers: number
  following: number
  posts: number
  bio: string
  profilePictureUrl: string
  isVerified: boolean
  category: string
}

export interface GrowthVelocityDetails {
  anomalyDays: string[]
  anomalyMagnitudes: number[]
  avgDailyGrowth: number
  maxDailyGrowth: number
  dataPointCount: number
}

export interface EngagementRateDetails {
  accountER: number
  benchmarkER: number
  ratio: number
  tier: string
  niche: string
  avgLikes: number
  avgComments: number
  postsAnalyzed: number
  percentile: number
}

export interface CommentSentimentDetails {
  totalAnalyzed: number
  authentic: number
  genericBot: number
  emojiOnly: number
  spam: number
  botRatio: number
  topBotPhrases: string[]
}

export interface SpikeEvent {
  date: string
  magnitude: number
  classification: 'explained' | 'partially_explained' | 'unexplained'
  nearestPost?: string
}

export interface SpikeDetectionDetails {
  totalSpikes: number
  explainedSpikes: number
  unexplainedSpikes: number
  largestSpikeSize: number
  largestSpikeDate: string
  spikes: SpikeEvent[]
}

export interface SignalResult<T = Record<string, unknown>> {
  score: number
  confidence: number
  summary: string
  details: T
}

export interface ScanSignals {
  growthVelocity: SignalResult<GrowthVelocityDetails>
  engagementRate: SignalResult<EngagementRateDetails>
  commentSentiment: SignalResult<CommentSentimentDetails>
  spikeDetection: SignalResult<SpikeDetectionDetails>
}

export interface ScanProgress {
  step: string
  stepsCompleted: number
  totalSteps: number
  estimatedSecondsRemaining: number
}

export interface FollowerSnapshot {
  date: string
  followers: number
}

export interface Scan {
  id: string
  status: ScanStatus
  platform: Platform
  handle: string
  fraudScore?: number
  riskLevel?: RiskLevel
  realReach?: number
  cached?: boolean
  dataQuality?: DataQuality
  riskSummary?: string
  profile?: ScanProfile
  signals?: ScanSignals
  followerHistory?: FollowerSnapshot[]
  progress?: ScanProgress
  errorMessage?: string
  createdAt: string
  expiresAt?: string
}

export interface DashboardStats {
  totalScans: number
  avgFraudScore: number
  highRiskCount: number
  scansThisMonth: number
  scanLimit: number
  scansUsed: number
  planName: string
}

export interface ScanFilters {
  page?: number
  limit?: number
  platform?: Platform
  riskLevel?: RiskLevel
  handle?: string
  status?: ScanStatus
  dateFrom?: string
  dateTo?: string
  scoreMin?: number
  scoreMax?: number
}

export interface PaginatedScans {
  data: Scan[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ShareReportResponse {
  shareUrl: string
  token: string
  expiresAt: string
}

export interface CreateScanResponse {
  id: string
  status: ScanStatus
  platform: Platform
  handle: string
  createdAt: string
  cached?: boolean
}
