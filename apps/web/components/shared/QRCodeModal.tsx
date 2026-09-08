'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useUIStore } from '@/store/ui-store';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

interface QRMember {
  id: string;
  name: string;
  amount: number;
}

export function QRCodeModal() {
  const { modalOpen, modalData, closeModal } = useUIStore();
  const { bankSetting } = useAppStore();

  const [selectedMember, setSelectedMember] = useState<QRMember | null>(null);
  const [members, setMembers] = useState<QRMember[]>([]);

  useEffect(() => {
    if (modalOpen === 'qr-code') {
      // Reset state when modal opens
      setSelectedMember(null);
      const dataMembers = modalData?.members as QRMember[] | undefined;
      if (dataMembers) {
        setMembers(dataMembers);
      }
      const member = modalData?.member as QRMember | undefined;
      if (member) {
        setSelectedMember(member);
      }
    }
  }, [modalOpen, modalData]);

  // Reset when modal closes
  useEffect(() => {
    if (modalOpen !== 'qr-code') {
      setSelectedMember(null);
      setMembers([]);
    }
  }, [modalOpen]);

  if (modalOpen !== 'qr-code') return null;

  const getBankCode = (bankName: string): string => {
    const bankCodes: Record<string, string> = {
      'Vietcombank': '970436',
      'BIDV': '970418',
      'VietinBank': '970415',
      'Agribank': '970405',
      'TPBank': '970423',
      'MBBank': '970426',
      'VPBank': '970432',
      'ACB': '970416',
      'Sacombank': '970403',
      'Techcombank': '970407',
    };
    return bankCodes[bankName] || '970436';
  };

  const generateQRContent = (member: QRMember) => {
    if (!bankSetting) return '';
    const bankCode = bankSetting.bank_bin || getBankCode(bankSetting.bank_name);
    const amount = member.amount;
    const content = bankSetting.account_number;
    return `https://img.vietqr.io/image/${bankCode}-${content}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(`4B THANH TOAN ${member.name}`)}&accountName=${encodeURIComponent(bankSetting.account_name)}`;
  };

  const handleDownload = () => {
    if (!selectedMember || !bankSetting) {
      toast.error('Chưa có thông tin ngân hàng');
      return;
    }

    const link = document.createElement('a');
    link.href = generateQRContent(selectedMember);
    link.download = `QR_${selectedMember.name}_${selectedMember.amount}.png`;
    link.target = '_blank';
    link.click();
    toast.success('Đang tải mã QR...');
  };

  const handleShare = async () => {
    if (!selectedMember) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mã QR Thanh Toán 4B',
          text: `Mã QR thanh toán cho ${selectedMember.name} - Số tiền: ${new Intl.NumberFormat('vi-VN').format(selectedMember.amount)} VNĐ`,
          url: generateQRContent(selectedMember),
        });
      } catch {
        toast.info('Đã sao chép thông tin!');
      }
    } else {
      toast.info('Trình duyệt không hỗ trợ chia sẻ');
    }
  };

  return (
    <Modal id="qr-code" title="Mã VietQR Thanh Toán" size="md">
      <div className="space-y-4">
        {/* Member Selector */}
        {!selectedMember && (
          <div>
            <label
              className="mb-2 block text-xs font-semibold"
              style={{ color: 'var(--dark)' }}
            >
              Chọn thành viên
            </label>
            <div className="space-y-2">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all hover:border-[var(--primary)]"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: 'var(--primary)' }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--dark)' }}>
                        {member.name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Số tiền cần thanh toán
                      </div>
                    </div>
                  </div>
                  <div
                    className="font-bold"
                    style={{ color: 'var(--primary)' }}
                  >
                    {new Intl.NumberFormat('vi-VN').format(member.amount)}đ
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Member QR */}
        {selectedMember && (
          <>
            {/* Back Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="flex items-center gap-2 text-sm transition-colors hover:text-[var(--primary)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <i className="fa-solid fa-arrow-left" />
              Chọn thành viên khác
            </button>

            {/* Member Info */}
            <div
              className="flex items-center gap-3 rounded-xl border p-4"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ background: 'var(--primary)' }}
              >
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--dark)' }}>
                  {selectedMember.name}
                </div>
                <div
                  className="font-bold"
                  style={{ color: 'var(--primary)' }}
                >
                  {new Intl.NumberFormat('vi-VN').format(selectedMember.amount)}đ
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div
              className="flex flex-col items-center rounded-xl border p-6"
              style={{ borderColor: 'var(--border)', background: 'white' }}
            >
              {bankSetting ? (
                <>
                  <img
                    src={generateQRContent(selectedMember)}
                    alt={`QR for ${selectedMember.name}`}
                    className="h-[250px] w-[250px] object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=4B_${selectedMember.name}_${selectedMember.amount}`;
                    }}
                  />
                  <p className="mt-3 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    Quét mã QR để thanh toán cho {selectedMember.name}
                  </p>
                </>
              ) : (
                <div className="flex h-[250px] w-[250px] items-center justify-center">
                  <div className="text-center">
                    <i className="fa-solid fa-triangle-exclamation text-3xl" style={{ color: 'var(--accent)' }} />
                    <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      Cần cập nhật thông tin ngân hàng<br />trong mục Cài đặt
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bank Info */}
            {bankSetting && (
              <div className="space-y-1 text-center text-sm" style={{ color: 'var(--dark)' }}>
                <div>
                  Ngân hàng: <strong>{bankSetting.bank_name}</strong>
                </div>
                <div>
                  STK: <strong>{bankSetting.account_number}</strong>
                </div>
                <div>
                  Chủ TK: <strong>{bankSetting.account_name}</strong>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--bg-light)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              >
                <i className="fa-solid fa-download mr-2" />
                Tải QR
              </button>
              <button
                onClick={handleShare}
                className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--bg-light)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              >
                <i className="fa-solid fa-share mr-2" />
                Chia sẻ
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
