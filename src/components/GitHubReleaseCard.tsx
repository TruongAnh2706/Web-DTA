
import { useEffect, useState } from 'react';
import { Download, ExternalLink, Github, Loader2, Tag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface GitHubReleaseCardProps {
    repoUrl: string | null;
}

interface ReleaseData {
    tag_name: string;
    published_at: string;
    html_url: string;
    body: string;
    assets: {
        name: string;
        browser_download_url: string;
        size: number;
        download_count: number;
    }[];
}

const GitHubReleaseCard = ({ repoUrl }: GitHubReleaseCardProps) => {
    const [release, setRelease] = useState<ReleaseData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!repoUrl || !repoUrl.includes('github.com')) return;

        const fetchRelease = async () => {
            setLoading(true);
            try {
                // Extract owner/repo from URL
                // Expected format: https://github.com/owner/repo
                const parts = repoUrl.split('github.com/');
                if (parts.length < 2) throw new Error('Invalid GitHub URL');

                const repoPath = parts[1].split('/').slice(0, 2).join('/'); // owner/repo

                const response = await fetch(`https://api.github.com/repos/${repoPath}/releases/latest`);

                if (!response.ok) {
                    if (response.status === 404) throw new Error('No releases found or private repo');
                    if (response.status === 403) throw new Error('API rate limit exceeded');
                    throw new Error('Failed to fetch release');
                }

                const data = await response.json();
                setRelease(data);
            } catch (err: any) {
                setError(err.message);
                console.error('GitHub API Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRelease();
    }, [repoUrl]);

    if (!repoUrl) return null;

    if (loading) {
        return (
            <div className="glass-card p-6 rounded-xl animate-pulse">
                <div className="h-4 bg-muted/50 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-muted/50 rounded w-1/4 mb-4"></div>
                <div className="h-20 bg-muted/50 rounded w-full"></div>
            </div>
        );
    }

    if (error || !release) {
        return null; // Silent fail or show error if preferred
    }

    return (
        <div className="glass-card p-6 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Github className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Latest Release</h3>
                        <Badge variant="outline" className="gap-1">
                            <Tag className="w-3 h-3" />
                            {release.tag_name}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(release.published_at), 'PPP')}
                    </div>
                </div>
                <a href={release.html_url} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="sm" className="h-8">
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </a>
            </div>

            {/* Release Notes Preview (Truncated) */}
            <div className="prose prose-sm dark:prose-invert max-h-32 overflow-y-auto mb-6 text-sm bg-background/50 p-3 rounded-lg">
                <p className="whitespace-pre-wrap">{release.body}</p>
            </div>

            <div className="space-y-2">
                {release.assets.map((asset) => (
                    <a key={asset.name} href={asset.browser_download_url} className="block">
                        <Button className="w-full btn-neon justify-between group" variant="default">
                            <span className="flex items-center gap-2">
                                <Download className="w-4 h-4 group-hover:animate-bounce" />
                                {asset.name}
                            </span>
                            <span className="text-xs opacity-70">
                                {(asset.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                        </Button>
                    </a>
                ))}
                {release.assets.length === 0 && (
                    <a href={release.html_url} target="_blank" rel="noreferrer" className="block">
                        <Button className="w-full btn-neon">
                            <Download className="w-4 h-4 mr-2" />
                            Download Source Code
                        </Button>
                    </a>
                )}
            </div>
        </div>
    );
};

export default GitHubReleaseCard;
