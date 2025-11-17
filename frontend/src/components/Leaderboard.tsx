import "./Leaderboard.css";
import { useEffect, useState } from "react";
import { buildPath } from './Path';

type LeaderboardEntry = {
	rank: number;
	Login: string;
	FirstName?: string;
	Credits: number;
};

export default function Leaderboard() {
	const [rows, setRows] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLeaderboard = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(buildPath("api/leaderboard"));
				const data = await res.json();
				if (data.error) {
					setError(data.error || "Unknown error");
					setRows([]);
				} else {
					setRows(data.leaderboard || []);
				}
			} catch (e: any) {
				setError(e.message || "Failed to fetch leaderboard");
				setRows([]);
			} finally {
				setLoading(false);
			}
		};

		fetchLeaderboard();
	}, []);

	return (
		<div className="leaderboard-page">
			<h2 className="leaderboard-title">Leaderboard</h2>

			{loading && <div className="leaderboard-info">Loading...</div>}
			{error && <div className="leaderboard-error">Error: {error}</div>}

			{!loading && !error && (
				<table className="leaderboard-table">
					<thead>
						<tr>
							<th>#</th>
							{/* <th>Username</th> */}
							<th>Name</th>
							<th>Credits</th>
						</tr>
					</thead>
					<tbody>
						{rows.length === 0 && (
							<tr>
								<td colSpan={4} className="leaderboard-empty">
									No entries found
								</td>
							</tr>
						)}

						{rows.map((r) => (
							<tr key={r.rank + "-" + r.Login}>
								<td>{r.rank}</td>
								{/* <td>{r.Login}</td> */}
								<td>{r.FirstName ?? "-"}</td>
								<td>{r.Credits}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
