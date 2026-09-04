import { useEffect, useState } from "react";
import { timerEngine } from "./timerEngine";

export const useTimer = () => {
	const [status, setStatus] = useState(timerEngine.getStatus());
	const [remaining, setRemaining] = useState(timerEngine.getRemaining());
	const [duration, setDuration] = useState(timerEngine.getDuration());

	useEffect(() => {
		const syncTimerState = () => {
			setStatus(timerEngine.getStatus());
			setRemaining(timerEngine.getRemaining());
			setDuration(timerEngine.getDuration());
		};

		syncTimerState();
		const unsubscribe = timerEngine.subscribe(syncTimerState);
		return () => {
			unsubscribe();
		};
	}, []);

	return {
		status,
		remaining,
		duration,
		start: (durationSeconds: number) => timerEngine.start(durationSeconds),
		pause: () => timerEngine.pause(),
		resume: () => timerEngine.resume(),
		reset: () => timerEngine.reset(),
		cancel: () => timerEngine.cancel(),
		setOnComplete: (callback: () => void) => timerEngine.setOnComplete(callback),
	};
};
