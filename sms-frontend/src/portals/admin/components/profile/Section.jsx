import React from 'react';
import Card from '../../../../components/ui/Card';

export default function Section({ title, description, children }) {
    return (
        <Card>
            <Card.Header title={title} subtitle={description} />
            <Card.Body className="space-y-4">{children}</Card.Body>
        </Card>
    );
}
