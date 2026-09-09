import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: Error & { status?: number; name?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[Error]", err.stack ?? err.message);

  if (err.name === "CastError") {
    res.status(404).json({ message: "Resource not found or invalid ID" });
    return;
  }

  if (err.name === "ValidationError") {
    res.status(400).json({ message: err.message });
    return;
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.status(err.status ?? 500).json({
    message: err.message ?? "Internal server error",
  });
}

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({ message: "Route not found" });
}
