import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import React from "react";
import "../../css/administrator.css";

export default function ChartCard({ title, data }) {
    const labelKey = data[0]?.mes ? "mes" : "nombre";

    return (
        <div className="admin-card admin-chart-card">
            <h4 className="admin-card-title">{title}</h4>
            <div className="admin-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-secondary)" opacity={0.4} />

                        <XAxis
                            dataKey={labelKey}
                            axisLine={{ stroke: "var(--color-secondary)" }}
                            tickLine={false}
                            tick={{ fill: "var(--color-dark)", fontSize: 12 }}
                        />

                        <YAxis
                            axisLine={{ stroke: "var(--color-secondary)" }}
                            tickLine={false}
                            tick={{ fill: "var(--color-dark)", fontSize: 12 }}
                        />


                        <Tooltip
                            contentStyle={{
                                backgroundColor: "var(--color-white)",
                                border: `1px solid var(--color-secondary)`,
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                color: "var(--color-dark)",
                            }}
                        />

                        <Bar dataKey="valor" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
