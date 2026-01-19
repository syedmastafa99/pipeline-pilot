import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CandidateCard } from '@/components/candidates/CandidateCard';
import { AddCandidateDialog } from '@/components/candidates/AddCandidateDialog';
import { useCandidates, Candidate } from '@/hooks/useCandidates';
import { STAGES, StageKey } from '@/lib/constants';
import { Search, Filter, Users } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function Pipeline() {
  const { data: candidates = [], isLoading } = useCandidates();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStage, setActiveStage] = useState<StageKey | 'all'>('all');

  const filteredCandidates = candidates.filter(candidate => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      candidate.full_name.toLowerCase().includes(query) ||
      candidate.passport_number?.toLowerCase().includes(query) ||
      candidate.employer?.toLowerCase().includes(query) ||
      candidate.destination_country?.toLowerCase().includes(query) ||
      candidate.agent_name?.toLowerCase().includes(query) ||
      candidate.ref_company?.toLowerCase().includes(query);
    
    const matchesStage = activeStage === 'all' || candidate.current_stage === activeStage;
    
    return matchesSearch && matchesStage;
  });

  const getCandidatesByStage = (stage: StageKey) => {
    return filteredCandidates.filter(c => c.current_stage === stage);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Pipeline</h1>
            <p className="mt-1 text-muted-foreground">
              Manage candidates through their journey
            </p>
          </div>
          <AddCandidateDialog />
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, passport, employer, country, agent, ref company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stage Tabs */}
        <Tabs value={activeStage} onValueChange={(v) => setActiveStage(v as StageKey | 'all')}>
          <ScrollArea className="w-full whitespace-nowrap">
            <TabsList className="inline-flex h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="all" className="px-4">
                All ({candidates.length})
              </TabsTrigger>
              {STAGES.map((stage) => {
                const count = getCandidatesByStage(stage.key).length;
                return (
                  <TabsTrigger key={stage.key} value={stage.key} className="px-3">
                    {stage.shortLabel} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value={activeStage} className="mt-6">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading candidates...</div>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 py-16">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 font-medium text-muted-foreground">No candidates found</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  {searchQuery ? 'Try adjusting your search' : 'Add your first candidate to get started'}
                </p>
                {!searchQuery && (
                  <div className="mt-4">
                    <AddCandidateDialog />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
