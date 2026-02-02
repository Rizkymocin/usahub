<?php

namespace Tests\Unit;

use App\Models\ResellerPayment;
use App\Repositories\ResellerPaymentRepository;
use App\Services\ResellerPaymentService;
use Mockery;
use PHPUnit\Framework\TestCase;
use Illuminate\Support\Collection;

class ResellerPaymentServiceTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
    }

    public function test_list_payments_calls_repository()
    {
        $repository = Mockery::mock(ResellerPaymentRepository::class);
        $service = new ResellerPaymentService($repository);

        $tenantId = 1;
        $businessId = 1;
        $payments = new Collection([]);

        $repository->shouldReceive('getAll')
            ->once()
            ->with($tenantId, $businessId)
            ->andReturn($payments);

        $result = $service->listPayments($tenantId, $businessId);

        $this->assertEquals($payments, $result);
    }
}
