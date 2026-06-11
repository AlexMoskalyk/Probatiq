"use client";

import { Button } from "@/src/components/ui/button";
import { env } from "@/src/data/env/client";
import { JobInfoTable } from "@/src/drizzle/schema";
import { CondensedMessages } from "@/src/services/hume/components/condensed-messages";
import { condenseChatMessages } from "@/src/services/hume/lib/condense-chat-messages";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { Loader2Icon, MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createInterview, updateInterview } from "../actions";
import { errorToast } from "@/src/lib/error-toast";

export function StartCall({
  jobInfo,
  user,
  accessToken,
}: {
  accessToken: string;
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "id" | "title" | "description" | "experienceLevel"
  >;
  user: {
    name: string;
    imageUrl: string;
  };
}) {
  const {
    connect,
    disconnect,
    readyState,
    chatMetadata,
    callDurationTimestamp,
  } = useVoice();
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [isEnding, startEndTransition] = useTransition();
  const durationRef = useRef(callDurationTimestamp);
  const readyStateRef = useRef(readyState);
  const failTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    readyStateRef.current = readyState;
    if (readyState === VoiceReadyState.OPEN && failTimerRef.current) {
      clearTimeout(failTimerRef.current);
      failTimerRef.current = null;
    }
  }, [readyState]);

  useEffect(() => {
    return () => {
      if (failTimerRef.current) clearTimeout(failTimerRef.current);
    };
  }, []);

  useEffect(() => {
    durationRef.current = callDurationTimestamp;
  }, [callDurationTimestamp]);

  useEffect(() => {
    if (chatMetadata?.chatId == null || interviewId == null) {
      return;
    }
    updateInterview(interviewId, { humeChatId: chatMetadata.chatId });
  }, [chatMetadata?.chatId, interviewId]);

  useEffect(() => {
    if (interviewId == null) return;
    const intervalId = setInterval(() => {
      if (durationRef.current == null) return;

      updateInterview(interviewId, { duration: durationRef.current });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [interviewId]);

  const handleEnd = () => {
    disconnect();
    if (interviewId == null) {
      startEndTransition(() => {
        router.push(`/dashboard/job-infos/${jobInfo.id}/interviews`);
      });
      return;
    }
    if (durationRef.current != null) {
      void updateInterview(interviewId, { duration: durationRef.current });
    }
    startEndTransition(() => {
      router.push(
        `/dashboard/job-infos/${jobInfo.id}/interviews/${interviewId}`,
      );
    });
  };

  const loader = (
    <div className="flex-1 min-h-0 flex items-center justify-center">
      <Loader2Icon className="animate-spin size-24" />
    </div>
  );

  if (isEnding) {
    return loader;
  }

  const startInterview = async () => {
    const res = await createInterview({ jobInfoId: jobInfo.id });
    if (res.error) {
      return errorToast(res.message);
    }
    setInterviewId(res.id);

    if (failTimerRef.current) clearTimeout(failTimerRef.current);
    failTimerRef.current = setTimeout(() => {
      if (readyStateRef.current !== VoiceReadyState.OPEN) {
        errorToast("Could not start interview — check microphone & network.");
      }
    }, 5000);

    connect({
      auth: { type: "accessToken", value: accessToken },
      configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
      sessionSettings: {
        type: "session_settings",
        variables: {
          userName: user.name,
          title: jobInfo.title || "Not Specified",
          description: jobInfo.description,
          experienceLevel: jobInfo.experienceLevel,
        },
      },
    });
  };

  if (readyState === VoiceReadyState.IDLE) {
    return (
      <div className="flex justify-center items-center flex-1 min-h-0">
        <Button size="lg" className="cursor-pointer" onClick={startInterview}>
          Start Interview
        </Button>
      </div>
    );
  }

  if (readyState === VoiceReadyState.CONNECTING) {
    return loader;
  }

  if (readyState === VoiceReadyState.CLOSED) {
    return (
      <div className="flex justify-center items-center flex-1 min-h-0">
        <Button size="lg" className="cursor-pointer" onClick={startInterview}>
          Restart Interview
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 min-h-0 flex flex-col-reverse">
      <div className="container py-6 flex flex-col items-center justify-end gap-4">
        <Messages user={user} />
        <Controls onEnd={handleEnd} />
      </div>
    </div>
  );
}

function Messages({ user }: { user: { name: string; imageUrl: string } }) {
  const { messages, fft } = useVoice();

  const condensedMessages = useMemo(() => {
    return condenseChatMessages(messages);
  }, [messages]);

  return (
    <CondensedMessages
      messages={condensedMessages}
      user={user}
      maxFft={Math.max(...fft)}
      className="max-w-5xl"
    />
  );
}

function Controls({ onEnd }: { onEnd: () => void }) {
  const { isMuted, mute, unmute, micFft, callDurationTimestamp } = useVoice();

  return (
    <div className="flex gap-5 rounded border px-5 py-2 w-fit sticky bottom-6 bg-background items-center">
      <Button
        variant="ghost"
        size="icon"
        className="-mx-3"
        onClick={() => (isMuted ? unmute() : mute())}
      >
        {isMuted ? <MicOffIcon className="text-destructive" /> : <MicIcon />}
        <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
      </Button>
      <div className="self-stretch">
        <FftVisualizer fft={micFft} />
      </div>
      <div className="text-sm text-muted-foreground tabular-nums">
        {callDurationTimestamp}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="-mx-3 cursor-pointer"
        onClick={onEnd}
      >
        <PhoneOffIcon className="text-destructive" />
        <span className="sr-only">End Call</span>
      </Button>
    </div>
  );
}

function FftVisualizer({ fft }: { fft: number[] }) {
  return (
    <div className="flex gap-1 items-center h-full">
      {fft.map((value, index) => {
        const percent = (value / 4) * 100;
        return (
          <div
            key={index}
            className="min-h-0.5 bg-primary/75 w-0.5 rounded"
            style={{ height: `${percent < 10 ? 0 : percent}%` }}
          />
        );
      })}
    </div>
  );
}
