'use client';

import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface SectionEditorProps {
  section: any;
  onSave: any;
  onClose: any;
}

export default function SectionEditor({ section, onSave, onClose }: SectionEditorProps) {
  const [content, setContent] = useState(JSON.stringify(section.content, null, 2));

  const handleSave = () => {
    try {
      const parsed = JSON.parse(content);
      onSave(section.id, parsed);
      onClose();
    } catch (error) {
      alert('Invalid JSON');
    }
  };

  return (
    <Modal show={true} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit {section.section_type}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Content (JSON)</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
