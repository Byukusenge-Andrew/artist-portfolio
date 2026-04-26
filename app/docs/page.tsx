'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  return (
    //suppress hydation
    
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      <SwaggerUI url="/api/docs/swagger.json" />
    </div>
  );
}
