import { Button } from 'react-bootstrap';

export default function Home() {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-1 mb-5">Werdell</h1>

      <div className="row justify-content-center">
        <div className="col-md-6">
          <Button href="/game" variant="primary" size="lg" className="mb-3">
            Play Now
          </Button>
          <br />
          <Button href="/login" variant="outline-primary" size="lg">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}

