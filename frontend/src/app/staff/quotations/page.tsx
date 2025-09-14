'use client';

import React, { useState } from 'react';
import { StaffLayout } from '@/components/layout/staff-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  DollarSign,
  User,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';

export default function StaffQuotationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [staffNotes, setStaffNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Mock data - replace with actual API calls
  const quotations = [
    {
      _id: '1',
      quotationNumber: 'QUO-20241201-1234',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1 234 567 8900',
      items: [
        { productName: 'Ray-Ban Aviator', quantity: 1, unitPrice: 150, totalPrice: 150 },
        { productName: 'Custom Lenses', quantity: 1, unitPrice: 100, totalPrice: 100 },
      ],
      totalAmount: 250,
      status: 'pending',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'Customer needs prescription lenses for reading',
      prescriptionFile: 'prescription_1234.pdf',
      createdAt: '2024-12-01T10:30:00Z',
    },
    {
      _id: '2',
      quotationNumber: 'QUO-20241201-1235',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      customerPhone: '+1 234 567 8901',
      items: [
        { productName: 'Oakley Sunglasses', quantity: 2, unitPrice: 120, totalPrice: 240 },
      ],
      totalAmount: 240,
      status: 'approved',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'Customer approved the quotation',
      prescriptionFile: null,
      createdAt: '2024-11-30T15:45:00Z',
    },
    {
      _id: '3',
      quotationNumber: 'QUO-20241201-1236',
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
      customerPhone: '+1 234 567 8902',
      items: [
        { productName: 'Gucci Frames', quantity: 1, unitPrice: 300, totalPrice: 300 },
        { productName: 'Progressive Lenses', quantity: 1, unitPrice: 150, totalPrice: 150 },
      ],
      totalAmount: 450,
      status: 'rejected',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'Customer found the price too high',
      prescriptionFile: 'prescription_1236.pdf',
      createdAt: '2024-11-29T09:20:00Z',
    },
  ];

  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || quotation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'converted':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleApprove = (quotation: any) => {
    setSelectedQuotation(quotation);
    setIsApproveDialogOpen(true);
  };

  const handleReject = (quotation: any) => {
    setSelectedQuotation(quotation);
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    // Implement approve logic
    console.log(`Approving quotation ${selectedQuotation?.quotationNumber} with notes: ${staffNotes}`);
    setIsApproveDialogOpen(false);
    setStaffNotes('');
  };

  const confirmReject = () => {
    // Implement reject logic
    console.log(`Rejecting quotation ${selectedQuotation?.quotationNumber} with reason: ${rejectionReason}`);
    setIsRejectDialogOpen(false);
    setRejectionReason('');
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600">Manage customer quotation requests and approvals.</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search quotations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="converted">Converted</option>
                  <option value="expired">Expired</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Quotations ({filteredQuotations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow key={quotation._id}>
                    <TableCell>
                      <div className="font-medium">{quotation.quotationNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quotation.customerName}</div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {quotation.customerEmail}
                        </div>
                        {quotation.customerPhone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-3 w-3 mr-1" />
                            {quotation.customerPhone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {quotation.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            {item.productName} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm font-medium">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {quotation.totalAmount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(quotation.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(quotation.status)}
                          {quotation.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(quotation.validUntil)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {quotation.notes}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {quotation.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(quotation)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleReject(quotation)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Approve Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Quotation</DialogTitle>
              <DialogDescription>
                Approve quotation {selectedQuotation?.quotationNumber} for {selectedQuotation?.customerName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Staff Notes (Optional)</label>
                <Textarea
                  placeholder="Add any internal notes about this quotation..."
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmApprove}>
                Approve Quotation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Quotation</DialogTitle>
              <DialogDescription>
                Reject quotation {selectedQuotation?.quotationNumber} for {selectedQuotation?.customerName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rejection Reason *</label>
                <Textarea
                  placeholder="Explain why this quotation is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Staff Notes (Optional)</label>
                <Textarea
                  placeholder="Add any internal notes about this rejection..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmReject} variant="destructive">
                Reject Quotation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StaffLayout>
  );
}
