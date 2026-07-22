export interface InspectionChecklistItem {
  aspect: string;
  result: string;
  passed: boolean;
}

export interface InspectionReport {
  _id: string;
  product: string;
  technicianId?: string;
  technicianName?: string;
  checklist: InspectionChecklistItem[];
  inspectedAt: string;
}
