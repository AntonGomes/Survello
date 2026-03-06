"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Square, Loader2 } from "lucide-react";

import { 
  getCurrentTimerOptions, 
  stopTimerMutation,
  readInstructionOptions
} from "@/client/@tanstack/react-query.gen";
import { Button } from "@/components/ui/button";

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;

export function GlobalTimer() {
  const queryClient = useQueryClient();
  const { data: activeEntry, isLoading } = useQuery({
    ...getCurrentTimerOptions(),
    refetchInterval: MS_PER_MINUTE,
  });

  const { mutate: stopTimer, isPending } = useMutation({
    ...stopTimerMutation(),
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getCurrentTimerOptions().queryKey });
        
        if (data.instruction_id) {
             queryClient.invalidateQueries({
                queryKey: readInstructionOptions({ path: { instruction_id: data.instruction_id } }).queryKey
             });
        }
    },
  });

  if (isLoading) return null; 
  if (!activeEntry) return null;

  return (
    <div className="flex items-center gap-3 bg-red-50 text-red-900 px-4 py-2 rounded-md border border-red-200 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
         <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <div className="flex flex-col leading-none">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Recording</span>
            <span className="text-sm font-medium truncate max-w-[150px]">{activeEntry.instruction_name}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="font-mono text-sm font-bold w-[4ch]">
            {activeEntry.duration_minutes}m
        </div>
        <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 text-red-700 hover:text-red-900 hover:bg-red-100"
            onClick={() => stopTimer({ query: {} })}
            disabled={isPending}
        >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4 fill-current" />}
        </Button>
      </div>
    </div>
  );
}
