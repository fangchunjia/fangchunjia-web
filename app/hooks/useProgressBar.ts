import { useEffect, useRef, useState } from "react";
import { useFetchers, useNavigation } from "react-router";

export default function useProgressBar(delay = 300) {
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const isNavigating =
    navigation.state !== "idle" || fetchers.some((f) => f.state !== "idle");

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isNavigating) {
      delayRef.current = setTimeout(() => {
        setVisible(true);
        setProgress(15);
        intervalRef.current = setInterval(() => {
          setProgress((p) => p + (90 - p) * 0.1);
        }, 200);
      }, delay);
    } else {
      clearTimeout(delayRef.current!);
      clearInterval(intervalRef.current!);
      if (visible) {
        setProgress(100);
        setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 300);
      }
    }
    return () => {
      clearTimeout(delayRef.current!);
      clearInterval(intervalRef.current!);
    };
  }, [isNavigating]);

  return { progress, visible };
}
