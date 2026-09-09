'use client';

import { useParams } from 'next/navigation';
import PostPropertyForm from '../../../../components/dashboard/PostPropertyForm';

export default function EditPropertyPage() {
  const params = useParams();
  return <PostPropertyForm propertyId={params.id} />;
}
