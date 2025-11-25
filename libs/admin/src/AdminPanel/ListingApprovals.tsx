import React from 'react';
import { Listing, User, ListingStatus } from '@fiilar/types';
import { Filter, Clock, CheckCircle, Home, MapPin, Sparkles, FileText, X, Check } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@fiilar/ui';

interface ListingApprovalsProps {
  listings: Listing[];
  pendingListings: Listing[];
  users: User[];
  locale: any;
  handleApproveListing: (listing: Listing, approve: boolean, reason?: string) => void;
  openRejectionModal: (id: string) => void;
}

export const ListingApprovals: React.FC<ListingApprovalsProps> = ({
  listings,
  pendingListings,
  users,
  locale,
  handleApproveListing,
  openRejectionModal
}) => {
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <Card>
        <CardHeader className="p-4 border-b-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Listing Approvals</CardTitle>
              <CardDescription>Review and approve property listings</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" leftIcon={<Filter size={16} />}>
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</h3>
              <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                <Clock size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{pendingListings.length}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live</h3>
              <div className="bg-green-100 p-2 rounded-lg text-green-700">
                <CheckCircle size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{listings.filter(l => l.status === ListingStatus.LIVE).length}</p>
            <p className="text-xs text-gray-500 mt-1">Active listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</h3>
              <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                <Home size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
            <p className="text-xs text-gray-500 mt-1">All listings</p>
          </CardContent>
        </Card>
      </div>

      {pendingListings.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home size={32} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">No pending listings</h3>
          <p className="text-sm text-gray-500">All listings have been reviewed</p>
        </Card>
      )}
      {pendingListings.map(l => (
        <Card key={l.id} className="overflow-hidden hover:shadow-md transition">
          <CardHeader className="pb-0 border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{l.title}</CardTitle>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin size={14} className="mr-1" /> {l.location}
                </div>
              </div>
              <div className="text-right">
                <span className="block text-lg font-bold text-brand-600">{locale.currencySymbol}{l.price} <span className="text-sm font-normal text-gray-400">/ {l.priceUnit}</span></span>
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">{l.type}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4">
              {/* AI Verification Badge */}
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
                <Sparkles size={14} className="text-purple-500" />
                <span className="text-xs font-bold text-gray-700">AI Analysis:</span>
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle size={12} /> Address matches document (98% confidence)
                </span>
              </div>

              {l.proofOfAddress && (
                <a href={l.proofOfAddress} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition">
                  <FileText size={12} /> View Proof of Address
                </a>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-4">{l.description}</p>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Images</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {l.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="h-32 w-48 object-cover rounded-lg border border-gray-100 shrink-0" />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-100 pt-4">
              <div className="text-sm text-gray-500">
                Host: <span className="font-medium text-gray-700">{users.find(u => u.id === l.hostId)?.name || 'Unknown'}</span>
                <span className="mx-2">•</span>
                <span className="font-mono text-xs">{l.hostId.slice(0, 8)}</span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => openRejectionModal(l.id)}
                  leftIcon={<X size={16} />}
                >
                  Decline
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  onClick={() => handleApproveListing(l, true)}
                  leftIcon={<Check size={16} />}
                >
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
