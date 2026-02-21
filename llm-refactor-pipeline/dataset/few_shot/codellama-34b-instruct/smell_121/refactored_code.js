const maxDepthErrors = consoleError.mock.calls.filter(call =>
          call[0]?.includes?.("Maximum update depth exceeded")
        );